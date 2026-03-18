import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify, cleanHtmlDescription } from "@/lib/utils";

/**
 * Extrae el ID de producto Shein desde una URL o deja el string si ya es un ID numérico.
 * Ej: ...-p-33704388.html, ...-j-369266460.html, ?product_id=123
 */
function extractSheinProductId(input: string): string | null {
  const trimmed = (input || "").trim();
  if (!trimmed) return null;
  const fromUrl =
    trimmed.match(/-[pjg]-(\d+)(?:\.html)?/i) ||
    trimmed.match(/[?&]product_id=(\d+)/i) ||
    trimmed.match(/shein[^/]*\/[^?]*[-_](\d+)(?:\.html)?/i);
  if (fromUrl) return fromUrl[1]!;
  if (/^\d+$/.test(trimmed)) return trimmed;
  return null;
}

/** Respuesta producto SearchAPI.io Shein (campos usados). */
interface SheinProductSearchApi {
  product_id: string;
  sku?: string;
  title: string;
  stock?: number;
  is_in_stock?: boolean;
  price?: string;
  extracted_price?: number;
  original_price?: string;
  extracted_original_price?: number;
  main_image?: string;
  images?: string[];
  specifications?: { name: string; value: string }[];
  variants?: {
    size?: Array<{
      sale_attributes?: Array<{ name: string; value: string }>;
      stock?: number;
      extracted_price?: number;
      extracted_original_price?: number;
    }>;
    colors?: Array<{
      product_id: string;
      title?: string;
      main_sale_attribute?: { value: string };
      secondary_sale_attributes?: Array<{ name: string; options?: string[] }>;
      extracted_price?: number;
      extracted_original_price?: number;
      stock?: number;
    }>;
  };
}

type SheinScrapedProduct = {
  title: string;
  description: string;
  images: string[];
  price: number;
  sku?: string;
};

function normalizeImageUrl(url: string): string {
  const u = (url || "").trim();
  if (!u) return "";
  if (u.startsWith("//")) return `https:${u}`;
  return u;
}

function parseMoney(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  const cleaned = value.replace(/[^0-9.,]/g, "").replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function extractJsonLdProductsFromHtml(html: string): any[] {
  const matches =
    html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi) || [];
  const out: any[] = [];
  for (const m of matches) {
    const inner = m
      .replace(/^[\s\S]*?<script[^>]*type=["']application\/ld\+json["'][^>]*>/i, "")
      .replace(/<\/script>[\s\S]*$/i, "")
      .trim();
    try {
      const parsed = JSON.parse(inner);
      out.push(parsed);
    } catch {
      // ignore malformed JSON-LD
    }
  }
  return out;
}

function extractMetaContent(html: string, property: string): string | null {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]*content=["']([^"']+)["'][^>]*>`,
    "i"
  );
  const m = html.match(re);
  return m?.[1] ?? null;
}

function extractImagesFromJsonLdValue(v: unknown): string[] {
  if (!v) return [];
  if (typeof v === "string") return v ? [normalizeImageUrl(v)] : [];
  if (Array.isArray(v)) {
    const out: string[] = [];
    for (const it of v) {
      if (typeof it === "string") out.push(normalizeImageUrl(it));
      else if (it && typeof it === "object") {
        const maybe = (it as any).url || (it as any).contentUrl || (it as any).src;
        if (typeof maybe === "string") out.push(normalizeImageUrl(maybe));
      }
    }
    return out;
  }
  if (typeof v === "object") {
    const maybe = (v as any).url || (v as any).contentUrl || (v as any).src;
    return typeof maybe === "string" ? [normalizeImageUrl(maybe)] : [];
  }
  return [];
}

function extractPriceFromJsonLd(productLd: any): number | null {
  const offers = productLd?.offers;
  if (!offers) return null;
  const priceRaw =
    offers?.price ??
    offers?.lowPrice ??
    offers?.highPrice ??
    offers?.currentPrice ??
    (typeof offers === "string" ? offers : null);
  return parseMoney(priceRaw);
}

async function scrapeSheinProduct(
  sheinProductId: string,
  rawInput: string
): Promise<SheinScrapedProduct | null> {
  const ua =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36";
  const headers = { "User-Agent": ua, Accept: "text/html,*/*" };

  const domainsToTry = ["us.shein.com", "es.shein.com", "roe.shein.com", "eur.shein.com"];
  const inputTrim = (rawInput || "").trim();
  const isUrl = /^https?:\/\//i.test(inputTrim);

  const candidates: string[] = [];
  if (isUrl) {
    candidates.push(inputTrim);
  } else {
    for (const d of domainsToTry) {
      // Slugs SEO pueden variar; normalmente Shein sirve el producto aunque el slug no sea exacto.
      candidates.push(`https://${d}/dsbayvkj-p-${sheinProductId}.html`);
      candidates.push(`https://${d}/product-p-${sheinProductId}.html`);
      candidates.push(`https://${d}/p-${sheinProductId}.html`);
    }
  }

  for (const candidateUrl of candidates) {
    try {
      const rJinaUrl = `https://r.jina.ai/${candidateUrl}`;
      const res = await fetch(rJinaUrl, { method: "GET", headers });
      const html = await res.text();
      if (!html || html.length < 20000) continue;

      const jsonLd = extractJsonLdProductsFromHtml(html);
      const productLd =
        jsonLd.find((x) => (x?.["@type"] === "Product" || x?.type === "Product")) ||
        jsonLd.find((x) => x?.["@type"] === "Product" || x?.type === "Product") ||
        jsonLd.find((x) => typeof x?.name === "string") ||
        null;

      const title =
        (productLd?.name as string) ||
        extractMetaContent(html, "og:title") ||
        extractMetaContent(html, "twitter:title") ||
        `Shein ${sheinProductId}`;

      const description =
        (productLd?.description as string) ||
        extractMetaContent(html, "og:description") ||
        extractMetaContent(html, "twitter:description") ||
        `Importado de Shein (ID: ${sheinProductId})`;

      const imagesFromLd = extractImagesFromJsonLdValue(
        productLd?.image ?? productLd?.images ?? productLd?.thumbnailUrl
      );

      const ogImage =
        extractMetaContent(html, "og:image") || extractMetaContent(html, "twitter:image") || null;

      // Fallback regex: URLs directas en el HTML (evita depender SOLO de JSON-LD)
      const htmlImgRe = /(https?:)?\/\/[^\s"'<>]+?\.(?:jpg|jpeg|png|webp)(?:\?[^\s"'<>]*)?/gi;
      const htmlImages = (html.match(htmlImgRe) || []).map((m) => normalizeImageUrl(m));

      const images: string[] = Array.from(new Set([...imagesFromLd, ogImage || "", ...htmlImages]))
        .filter(Boolean)
        .slice(0, 10);

      const price =
        extractPriceFromJsonLd(productLd) ||
        parseMoney(extractMetaContent(html, "product:price:amount")) ||
        parseMoney(extractMetaContent(html, "og:price:amount")) ||
        10;

      if (title && title.trim().length > 0) {
        return {
          title,
          description,
          images,
          price,
          sku: sheinProductId,
        };
      }
    } catch {
      // continue
    }
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const rawId = (body.sheinProductId ?? body.productId ?? body.id ?? "").toString().trim();
    const sheinProductId = extractSheinProductId(rawId);

    if (!sheinProductId) {
      return NextResponse.json(
        {
          error:
            "Indica el ID del producto Shein (ej: 33704388) o pega la URL del producto (ej: ...-p-33704388.html).",
        },
        { status: 400 }
      );
    }

    const searchApiKey = process.env.SEARCHAPI_API_KEY?.trim() || "";

    let sheinProvider = await prisma.dropshippingProvider.findFirst({
      where: { code: "shein" },
    });
    if (!sheinProvider) {
      sheinProvider = await prisma.dropshippingProvider.create({
        data: { name: "Shein", code: "shein", isActive: true },
      });
    }

    // SearchAPI (opcional): si existe la clave, intentamos primero. Si falla, hacemos scraping.
    const domainsToTry = ["es.shein.com", "us.shein.com", "roe.shein.com"];
    let productData: SheinProductSearchApi | null = null;
    let lastError = "";

    if (searchApiKey) {
      for (const sheinDomain of domainsToTry) {
        const apiUrl = new URL("https://www.searchapi.io/api/v1/search");
        apiUrl.searchParams.set("engine", "shein_product");
        apiUrl.searchParams.set("product_id", sheinProductId);
        apiUrl.searchParams.set("api_key", searchApiKey);
        apiUrl.searchParams.set("shein_domain", sheinDomain);

        const productRes = await fetch(apiUrl.toString(), { method: "GET" });
        const json = (await productRes.json()) as {
          product?: SheinProductSearchApi;
          error?: string;
          search_metadata?: { status?: string };
        };

        if (!productRes.ok) {
          lastError = json.error || `SearchAPI ${productRes.status}`;
          console.error("[shein import] SearchAPI error", {
            domain: sheinDomain,
            status: productRes.status,
            error: json.error,
          });
          continue;
        }
        if (json.product?.title) {
          productData = json.product;
          break;
        }
        lastError = json.error || "Producto no encontrado en este dominio.";
      }
    }

    if (!productData?.title) {
      // Fallback: scraping directo de la página de Shein (sin API).
      const scraped = await scrapeSheinProduct(sheinProductId, rawId);
      if (!scraped) {
        const isSearchApiInternal = (lastError || "").toLowerCase().includes("internal searchapi error");
        const status = isSearchApiInternal ? 502 : 404;
        return NextResponse.json(
          {
            error:
              lastError ||
              "No se pudo importar desde Shein. Comprueba el ID o la URL del producto.",
          },
          { status }
        );
      }
      console.log("[shein import] scrape success", {
        productId: sheinProductId,
        title: scraped.title,
        price: scraped.price,
        imagesCount: scraped.images?.length ?? 0,
        imagesSample: scraped.images?.slice(0, 3) ?? [],
      });

      productData = {
        product_id: sheinProductId,
        sku: sheinProductId,
        title: scraped.title,
        stock: 10,
        extracted_price: scraped.price,
        extracted_original_price: scraped.price * 1.2,
        images: scraped.images,
        main_image: scraped.images[0],
        specifications: [{ name: "Descripción", value: cleanHtmlDescription(scraped.description) }],
        variants: undefined,
      };
    }

    const name = productData.title;
    const baseSlug = slugify(name);
    let slug = baseSlug;
    let suffix = 0;
    while (true) {
      const existing = await prisma.product.findUnique({ where: { slug } });
      if (!existing) break;
      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }

    const imageUrls = productData.images && productData.images.length > 0
      ? productData.images
      : productData.main_image
        ? [productData.main_image]
        : [];
    const truncatedImages = imageUrls.slice(0, 10);

    const costPrice = productData.extracted_price ?? 0;
    const comparePrice = productData.extracted_original_price ?? costPrice * 1.2;
    const salePrice = costPrice * 2.0;
    const compareAtPrice = comparePrice * 1.5;

    const sizeVariants = productData.variants?.size ?? [];
    const colorVariants = productData.variants?.colors ?? [];
    const hasSizes = sizeVariants.length > 0;
    const hasColors = colorVariants.length > 0;

    type VariantRow = {
      name: string;
      sku: string;
      providerVariantId: string;
      price: number;
      compareAtPrice: number;
      stock: number;
      imageUrl: string | null;
    };

    const variantsToInsert: VariantRow[] = [];

    if (hasSizes) {
      sizeVariants.forEach((s, index) => {
        const sizeVal = s.sale_attributes?.find((a) => a.name === "Size")?.value ?? `Size ${index + 1}`;
        const price = (s.extracted_price ?? costPrice) * 2.0;
        const compare = (s.extracted_original_price ?? price) * 1.2;
        variantsToInsert.push({
          name: sizeVal,
          sku: `${productData.sku || sheinProductId}-${sizeVal.replace(/\s+/g, "-")}`,
          providerVariantId: `${sheinProductId}-${sizeVal}`,
          price,
          compareAtPrice: compare,
          stock: s.stock ?? 10,
          imageUrl: null,
        });
      });
    } else if (hasColors) {
      colorVariants.forEach((c, index) => {
        const colorName = c.main_sale_attribute?.value ?? c.title ?? `Color ${index + 1}`;
        const price = (c.extracted_price ?? costPrice) * 2.0;
        const compare = (c.extracted_original_price ?? price) * 1.2;
        variantsToInsert.push({
          name: colorName,
          sku: `${productData.sku || sheinProductId}-${String(index + 1)}`,
          providerVariantId: c.product_id || `${sheinProductId}-${index + 1}`,
          price,
          compareAtPrice: compare,
          stock: c.stock ?? 10,
          imageUrl: null,
        });
      });
    }

    if (variantsToInsert.length === 0) {
      variantsToInsert.push({
        name: "Único",
        sku: productData.sku || sheinProductId,
        providerVariantId: sheinProductId,
        price: salePrice,
        compareAtPrice: compareAtPrice,
        stock: productData.stock ?? 10,
        imageUrl: productData.main_image || null,
      });
    }

    const totalStock = variantsToInsert.reduce((acc, v) => acc + v.stock, 0);
    const minPrice = Math.min(...variantsToInsert.map((v) => v.price));

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: productData.specifications
          ? productData.specifications.map((s) => `${s.name}: ${s.value}`).join("\n") ||
            `Importado de Shein (ID: ${sheinProductId})`
          : `Importado de Shein (ID: ${sheinProductId})`,
        shortDescription: productData.sku ? `SKU ${productData.sku}` : "Shein",
        price: minPrice,
        compareAtPrice: variantsToInsert[0]?.compareAtPrice ?? compareAtPrice,
        costPrice,
        sku: productData.sku || sheinProductId,
        stock: totalStock,
        trackInventory: true,
        isActive: true,
        providerId: sheinProvider.id,
        providerProductId: sheinProductId,
      },
    });

    if (truncatedImages.length > 0) {
      await prisma.productImage.createMany({
        data: truncatedImages.map((url, i) => ({
          productId: product.id,
          url,
          alt: name,
          order: i,
        })),
      });
    }

    await prisma.productVariant.createMany({
      data: variantsToInsert.map((v) => ({
        productId: product.id,
        name: v.name,
        sku: v.sku,
        providerVariantId: v.providerVariantId,
        price: v.price,
        compareAtPrice: v.compareAtPrice,
        stock: v.stock,
        imageUrl: v.imageUrl,
      })),
    });

    return NextResponse.json({
      success: true,
      id: product.id,
      slug: product.slug,
      message: "Producto Shein importado correctamente.",
    });
  } catch (error) {
    console.error("Error importando desde Shein:", error);
    return NextResponse.json(
      { error: "Error interno importando el producto de Shein." },
      { status: 500 }
    );
  }
}
