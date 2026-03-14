import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify, cleanHtmlDescription } from "@/lib/utils";

const PRINTFUL_API_BASE = "https://api.printful.com";
const PRINTFUL_CDN = "https://files.cdn.printful.com";

/** Construye URL de imagen de Printful (puede venir relativa o vacía). */
function printfulImageUrl(productId: number, imagePath: string | null | undefined): string | null {
  const raw = (imagePath ?? "").trim();
  if (!raw) return null;
  if (raw.startsWith("http")) return raw;
  return `${PRINTFUL_CDN}/products/${productId}/${raw}`.replace(/\/+/g, "/");
}

/**
 * Importa un producto del catálogo de Printful (Catalog API).
 * Body: { printfulProductId: number } — ID del producto en Printful (ej. 71).
 * Crea el producto en YaraLuxe con proveedor Printful y variant_id en cada variante.
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const printfulProductId = body.printfulProductId != null ? Number(body.printfulProductId) : NaN;
    if (!Number.isInteger(printfulProductId) || printfulProductId <= 0) {
      return NextResponse.json(
        { error: "Falta o es inválido el ID del producto de Printful (debe ser un número, ej. 71)." },
        { status: 400 }
      );
    }

    const printfulProvider = await prisma.dropshippingProvider.findFirst({
      where: { code: "printful", isActive: true },
    });

    if (!printfulProvider) {
      return NextResponse.json(
        { error: "El proveedor Printful no existe o no está activo. Ejecuta el seed o créalo en Admin → Proveedores." },
        { status: 400 }
      );
    }

    const token = (printfulProvider.accessToken ?? printfulProvider.apiKey)?.trim();
    if (!token) {
      return NextResponse.json(
        { error: "Printful no tiene Access Token. Ve a Admin → Proveedores → Printful → Configurar API y pega tu Private Token." },
        { status: 400 }
      );
    }

    const productRes = await fetch(`${PRINTFUL_API_BASE}/products/${printfulProductId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-PF-Language": "es_ES",
      },
    });

    const productJson = await productRes.json();

    if (!productRes.ok || productJson.code >= 400) {
      const msg = productJson.error?.message ?? productJson.result ?? "No se encontró el producto en Printful.";
      return NextResponse.json(
        { error: typeof msg === "string" ? msg : "Error al obtener producto de Printful." },
        { status: productRes.status >= 500 ? 500 : 404 }
      );
    }

    const { product: pfProduct, variants: pfVariants } = productJson.result ?? {};
    if (!pfProduct || !Array.isArray(pfVariants) || pfVariants.length === 0) {
      return NextResponse.json(
        { error: "El producto de Printful no tiene variantes. Solo se pueden importar productos con al menos una variante." },
        { status: 400 }
      );
    }

    const name = pfProduct.title || pfProduct.type_name || `Printful ${printfulProductId}`;
    const baseSlug = slugify(name);
    let slug = baseSlug;
    let suffix = 0;
    while (true) {
      const existing = await prisma.product.findUnique({ where: { slug } });
      if (!existing) break;
      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }

    // Imagen principal: producto o primera variante con imagen
    const mainImageUrl =
      printfulImageUrl(pfProduct.id, pfProduct.image) ??
      (pfVariants[0] && printfulImageUrl(pfProduct.id, pfVariants[0].image));
    const imageUrls: { url: string; alt: string; order: number }[] = [];
    if (mainImageUrl) imageUrls.push({ url: mainImageUrl, alt: name, order: 0 });
    for (let i = 0; i < pfVariants.length && imageUrls.length < 10; i++) {
      const v = pfVariants[i];
      const url = printfulImageUrl(pfProduct.id, v.image);
      if (url && !imageUrls.some((img) => img.url === url)) {
        imageUrls.push({ url, alt: name, order: imageUrls.length });
      }
    }

    // Variantes: variant.id es el variant_id que usamos al crear pedidos
    const MARGIN = 2.0;
    let minPrice: number | null = null;
    const parsedVariants = pfVariants.map((v: { id: number; name?: string; size?: string; color?: string; price?: string; image?: string }, index: number) => {
      const price = parseFloat(v.price) || 0;
      if (minPrice === null || price < minPrice) minPrice = price;
      const variantName = [v.size, v.color].filter(Boolean).join(" / ") || v.name || `Variante ${index + 1}`;
      const variantImage = printfulImageUrl(pfProduct.id, v.image);
      return {
        name: variantName,
        sku: `PF-${printfulProductId}-${v.id}`,
        providerVariantId: String(v.id),
        price: price * MARGIN,
        compareAtPrice: price * (MARGIN + 0.5),
        stock: 999,
        imageUrl: variantImage,
        options: JSON.stringify({ size: v.size ?? "", color: v.color ?? "" }),
      };
    });

    const basePrice = minPrice !== null ? minPrice * MARGIN : 0;
    const baseCompare = minPrice !== null ? minPrice * (MARGIN + 0.5) : 0;

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: cleanHtmlDescription(pfProduct.description) || `Importado de Printful (ID: ${printfulProductId}). ${pfProduct.type_name || ""}`,
        shortDescription: pfProduct.type_name || "Printful",
        price: basePrice,
        compareAtPrice: baseCompare,
        costPrice: minPrice ?? 0,
        sku: `PF-${printfulProductId}`,
        stock: parsedVariants.reduce((acc, v) => acc + v.stock, 0),
        trackInventory: true,
        isActive: true,
        providerId: printfulProvider.id,
        providerProductId: String(printfulProductId),
      },
    });

    if (imageUrls.length > 0) {
      await prisma.productImage.createMany({
        data: imageUrls.map((img) => ({
          productId: product.id,
          url: img.url,
          alt: img.alt,
          order: img.order,
        })),
      });
    }

    await prisma.productVariant.createMany({
      data: parsedVariants.map((v) => ({
        productId: product.id,
        name: v.name,
        sku: v.sku,
        providerVariantId: v.providerVariantId,
        price: v.price,
        compareAtPrice: v.compareAtPrice,
        stock: v.stock,
        imageUrl: v.imageUrl,
        options: v.options,
      })),
    });

    return NextResponse.json({
      success: true,
      id: product.id,
      slug: product.slug,
      message: `Producto "${name}" importado desde Printful con ${parsedVariants.length} variante(s). Listo para vender.`,
    });
  } catch (error) {
    console.error("Error importando desde Printful:", error);
    return NextResponse.json(
      { error: "Error interno importando el producto de Printful." },
      { status: 500 }
    );
  }
}
