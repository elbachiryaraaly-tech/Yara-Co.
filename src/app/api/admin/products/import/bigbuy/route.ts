import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify, cleanHtmlDescription } from "@/lib/utils";

const BIGBUY_API_BASE = "https://api.bigbuy.eu/rest";

/**
 * Importa un producto del catálogo de BigBuy.
 * Body: { bigbuyProductId: number } — ID del producto en BigBuy (catálogo).
 * Crea el producto en YaraLuxe con proveedor BigBuy y SKU en la variante para enviar pedidos.
 * Documentación: https://api.bigbuy.eu/rest/doc
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const bigbuyProductId = body.bigbuyProductId != null ? Number(body.bigbuyProductId) : NaN;
    if (!Number.isInteger(bigbuyProductId) || bigbuyProductId <= 0) {
      return NextResponse.json(
        { error: "Falta o es inválido el ID del producto de BigBuy (debe ser un número)." },
        { status: 400 }
      );
    }

    const bigbuyProvider = await prisma.dropshippingProvider.findFirst({
      where: { code: "bigbuy", isActive: true },
    });

    if (!bigbuyProvider) {
      return NextResponse.json(
        { error: "El proveedor BigBuy no existe o no está activo. Ejecuta el seed o créalo en Admin → Proveedores." },
        { status: 400 }
      );
    }

    const token = (bigbuyProvider.accessToken ?? bigbuyProvider.apiKey)?.trim();
    if (!token) {
      return NextResponse.json(
        { error: "BigBuy no tiene API Key. Ve a Admin → Proveedores → BigBuy → Configurar API y pega tu token." },
        { status: 400 }
      );
    }

    // BigBuy Catalog API: obtener producto por ID (doc: https://api.bigbuy.eu/rest/doc)
    let productRes = await fetch(`${BIGBUY_API_BASE}/catalog/product/${bigbuyProductId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    // Algunas versiones de la API usan productinformation
    if (productRes.status === 404) {
      productRes = await fetch(`${BIGBUY_API_BASE}/catalog/productinformation/${bigbuyProductId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
    }

    const productJson = await productRes.json();

    if (!productRes.ok) {
      const msg =
        (typeof productJson === "object" && productJson?.message) ||
        (typeof productJson === "string" ? productJson : "") ||
        "No se encontró el producto en BigBuy. Verifica el ID en la documentación: https://api.bigbuy.eu/rest/doc";
      return NextResponse.json(
        { error: msg },
        { status: productRes.status >= 500 ? 500 : 404 }
      );
    }

    // La API puede devolver el objeto directamente o dentro de una propiedad
    const raw = Array.isArray(productJson) ? productJson[0] : productJson;
    const pf = raw?.product ?? raw;
    if (!pf) {
      return NextResponse.json(
        { error: "La respuesta de BigBuy no contiene datos de producto." },
        { status: 400 }
      );
    }

    const sku = (pf.sku ?? pf.SKU ?? String(bigbuyProductId)).toString().trim();
    const name = (pf.name ?? pf.title ?? pf.description ?? `BigBuy ${bigbuyProductId}`).toString().trim() || `Producto ${bigbuyProductId}`;
    const description = cleanHtmlDescription(pf.longDescription ?? pf.description ?? pf.desc ?? "") || `Importado de BigBuy (ID: ${bigbuyProductId}).`;
    const wholesalePrice = parseFloat(pf.wholesalePrice ?? pf.costPrice ?? pf.price ?? 0) || 0;
    const MARGIN = 2.0;
    const price = wholesalePrice * MARGIN;
    const compareAtPrice = wholesalePrice * (MARGIN + 0.3);
    const stock = Math.max(0, parseInt(String(pf.stock ?? pf.quantity ?? 99), 10)) || 99;

    // Imágenes: pueden venir en product.images[] o product.image o imageUrl
    const imageUrls: string[] = [];
    if (pf.images && Array.isArray(pf.images)) {
      for (const img of pf.images.slice(0, 10)) {
        const url = typeof img === "string" ? img : img?.url ?? img?.src;
        if (url && typeof url === "string") imageUrls.push(url);
      }
    }
    if (pf.image && !imageUrls.includes(String(pf.image))) imageUrls.unshift(String(pf.image));
    if (pf.imageUrl && !imageUrls.includes(String(pf.imageUrl))) imageUrls.unshift(String(pf.imageUrl));

    const baseSlug = slugify(name);
    let slug = baseSlug;
    let suffix = 0;
    while (true) {
      const existing = await prisma.product.findUnique({ where: { slug } });
      if (!existing) break;
      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        shortDescription: (pf.shortDescription ?? name).toString().slice(0, 255),
        price,
        compareAtPrice,
        costPrice: wholesalePrice,
        sku: sku || `BB-${bigbuyProductId}`,
        stock,
        trackInventory: true,
        isActive: true,
        providerId: bigbuyProvider.id,
        providerProductId: String(bigbuyProductId),
      },
    });

    if (imageUrls.length > 0) {
      await prisma.productImage.createMany({
        data: imageUrls.slice(0, 10).map((url, i) => ({
          productId: product.id,
          url,
          alt: name,
          order: i,
        })),
      });
    }

    // Una variante con el SKU de BigBuy (necesario para placeOrder)
    await prisma.productVariant.create({
      data: {
        productId: product.id,
        name: name.slice(0, 200),
        sku: sku || `BB-${bigbuyProductId}`,
        providerVariantId: sku || String(bigbuyProductId),
        price,
        compareAtPrice,
        stock,
        options: "{}",
      },
    });

    return NextResponse.json({
      success: true,
      id: product.id,
      slug: product.slug,
      message: `Producto "${name}" importado desde BigBuy con SKU ${sku}. Listo para vender.`,
    });
  } catch (error) {
    console.error("Error importando desde BigBuy:", error);
    const message = error instanceof Error ? error.message : "Error interno importando el producto de BigBuy.";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
