import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

function extractAliExpressProductId(input: string): string | null {
  const raw = (input || "").trim();
  if (!raw) return null;
  if (/^\d+$/.test(raw)) return raw;

  const fromUrl =
    raw.match(/\/item\/(\d+)\.html/i) ||
    raw.match(/\/item\/(\d+)(?:\?|#)/i) ||
    raw.match(/[?&](itemId|productId|product_id|num_iid)=(\d+)/i);
  if (!fromUrl) return null;
  if (fromUrl.length === 2) return fromUrl[1]!;
  return fromUrl[fromUrl.length - 1]!;
}

function parseMoney(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  const cleaned = value.replace(/[^0-9.,]/g, "").replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function safeArray(x: unknown): string[] {
  if (!x) return [];
  if (Array.isArray(x)) return x.filter((v) => typeof v === "string") as string[];
  if (typeof x === "string") return [x];
  return [];
}

function extractJsonLdProducts(html: string): any[] {
  const matches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
  const results: any[] = [];
  for (const m of matches) {
    const inner = m
      .replace(/^[\s\S]*?<script[^>]*type=["']application\/ld\+json["'][^>]*>/i, "")
      .replace(/<\/script>[\s\S]*$/i, "")
      .trim();
    try {
      const parsed = JSON.parse(inner);
      results.push(parsed);
    } catch {
      // Ignore malformed JSON-LD
    }
  }
  return results;
}

function extractOgMeta(html: string, property: string): string | null {
  const re = new RegExp(`<meta[^>]+property=["']${property}["'][^>]*content=["']([^"']+)["'][^>]*>`, "i");
  const m = html.match(re);
  return m?.[1] ?? null;
}

function normalizeImageUrl(url: string): string {
  const u = url.trim();
  if (u.startsWith("//")) return `https:${u}`;
  return u;
}

function extractImageUrlsFromLdValue(v: unknown): string[] {
  // JSON-LD puede traer image como string, array de strings o array de objetos { url }
  if (!v) return [];
  if (typeof v === "string") return [normalizeImageUrl(v)];
  if (Array.isArray(v)) {
    const out: string[] = [];
    for (const item of v) {
      if (typeof item === "string") out.push(normalizeImageUrl(item));
      else if (item && typeof item === "object") {
        const maybeUrl = (item as any).url || (item as any).contentUrl || (item as any).src;
        if (typeof maybeUrl === "string") out.push(normalizeImageUrl(maybeUrl));
      }
    }
    return out;
  }
  if (typeof v === "object") {
    const maybeUrl = (v as any).url || (v as any).contentUrl || (v as any).src;
    return typeof maybeUrl === "string" ? [normalizeImageUrl(maybeUrl)] : [];
  }
  return [];
}

function extractImageUrlsFromHtmlRegex(html: string): string[] {
  // Fallback: busca URLs directas de imágenes dentro del HTML.
  // Esto evita depender 100% de que JSON-LD esté presente o parseable.
  const re = /(https?:)?\/\/[^\s"'<>]+?\.(?:jpg|jpeg|png|webp)(?:\?[^\s"'<>]*)?/gi;
  const matches = html.match(re) || [];
  const normalized = matches.map((m) => normalizeImageUrl(m));
  // Deduplicar manteniendo orden
  const seen = new Set<string>();
  const out: string[] = [];
  for (const u of normalized) {
    if (seen.has(u)) continue;
    seen.add(u);
    out.push(u);
  }
  return out;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const rawInput = (body.aliexpressProductId ?? body.productId ?? body.id ?? "").toString().trim();
    const aliexpressProductId = extractAliExpressProductId(rawInput);

    if (!aliexpressProductId) {
      return NextResponse.json(
        { error: "Indica el ID del producto de AliExpress (o pega la URL del producto)." },
        { status: 400 }
      );
    }

    // Asegurar proveedor (para que providerId/code funcione con el sistema existente).
    let provider = await prisma.dropshippingProvider.findFirst({ where: { code: "aliexpress" } });
    if (!provider) {
      provider = await prisma.dropshippingProvider.create({
        data: { name: "AliExpress", code: "aliexpress", isActive: true },
      });
    }

    // Idempotencia simple
    const existing = await prisma.product.findFirst({
      where: { providerId: provider.id, providerProductId: aliexpressProductId },
      select: { id: true, slug: true },
    });
    if (existing) {
      return NextResponse.json({
        success: true,
        id: existing.id,
        slug: existing.slug,
        message: "El producto ya existe (no se duplicó).",
      });
    }

    // Construye URL pública del producto (esto es scraping, no API).
    const aliUrl = `https://www.aliexpress.com/item/${aliexpressProductId}.html`;
    const rJinaUrl = `https://r.jina.ai/${aliUrl}`;

    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    };

    // r.jina.ai suele funcionar mejor para extraer el HTML sin bloquear tanto.
    const fetchCandidates = [rJinaUrl, aliUrl];
    let html = "";
    let fetchError = "";
    for (const u of fetchCandidates) {
      try {
        const res = await fetch(u, { headers, redirect: "follow" });
        const text = await res.text();
        if (text && text.length > 500) {
          html = text;
          break;
        }
        fetchError = `HTTP ${res.status}`;
      } catch (e) {
        fetchError = e instanceof Error ? e.message : String(e);
      }
    }

    if (!html) {
      return NextResponse.json(
        { error: `No se pudo obtener el HTML de AliExpress. ${fetchError || ""}`.trim() },
        { status: 502 }
      );
    }

    // Intentar sacar título/precio/imágenes desde JSON-LD.
    const jsonLdList = extractJsonLdProducts(html);
    const productLd =
      jsonLdList.find((x) => x?.["@type"] === "Product") ||
      jsonLdList.find((x) => x?.type === "Product") ||
      jsonLdList[0];

    const title =
      (productLd?.name as string) ||
      extractOgMeta(html, "og:title") ||
      `AliExpress ${aliexpressProductId}`;

    const description =
      (productLd?.description as string) ||
      extractOgMeta(html, "og:description") ||
      `Importado de AliExpress (ID: ${aliexpressProductId})`;

    const images =
      [
        ...extractImageUrlsFromLdValue(productLd?.image),
        ...extractImageUrlsFromLdValue(productLd?.additionalImage),
        ...extractImageUrlsFromLdValue(productLd?.thumbnailUrl),
        ...(extractOgMeta(html, "og:image") ? safeArray(extractOgMeta(html, "og:image")!) : []),
        ...(extractOgMeta(html, "og:image:secure_url") ? safeArray(extractOgMeta(html, "og:image:secure_url")!) : []),
        ...(extractOgMeta(html, "twitter:image") ? safeArray(extractOgMeta(html, "twitter:image")!) : []),
        ...extractImageUrlsFromHtmlRegex(html),
      ]
        .filter(Boolean)
        .slice(0, 30);

    console.log("[aliexpress import] images extracted", {
      productId: aliexpressProductId,
      count: images.length,
      sample: images.slice(0, 3),
    });

    // Precio: JSON-LD puede tener offers.price o offers.lowPrice/highPrice.
    const offers = productLd?.offers ?? null;
    const priceRaw =
      offers?.price ??
      offers?.lowPrice ??
      offers?.highPrice ??
      (typeof productLd?.price === "string" ? productLd?.price : undefined);
    const costPriceVal = parseMoney(priceRaw);

    const costPrice = costPriceVal ?? 0;
    const price = costPrice > 0 ? costPrice * 2.0 : 0;
    const compareAtPrice = costPrice > 0 ? costPrice * 2.5 : undefined;

    // Stock: normalmente no viene en JSON-LD; dejamos un fallback.
    const stock = 10;

    const baseSlug = slugify(title);
    let slug = baseSlug;
    let suffix = 0;
    while (await prisma.product.findUnique({ where: { slug } })) {
      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }

    const product = await prisma.product.create({
      data: {
        name: title,
        slug,
        description,
        shortDescription: title.length > 140 ? `${title.slice(0, 140)}...` : title,
        price,
        compareAtPrice: compareAtPrice as any,
        costPrice: costPrice as any,
        sku: aliexpressProductId,
        stock,
        trackInventory: true,
        isActive: true,
        providerId: provider.id,
        providerProductId: aliexpressProductId,
      },
    });

    if (images.length > 0) {
      await prisma.productImage.createMany({
        data: images.slice(0, 10).map((url, i) => ({
          productId: product.id,
          url,
          alt: title,
          order: i,
        })),
      });
    }

    // Variante mínima para que el pedido use providerProductId y opcionalmente sku.
    await prisma.productVariant.createMany({
      data: [
        {
          productId: product.id,
          name: "Único",
          sku: aliexpressProductId,
          price,
          compareAtPrice: compareAtPrice as any,
          stock,
          options: JSON.stringify({ source: "aliexpress-scrape" }),
        },
      ],
    });

    return NextResponse.json({
      success: true,
      id: product.id,
      slug: product.slug,
      message: "Producto AliExpress importado por scraping correctamente.",
    });
  } catch (error) {
    console.error("Error importando desde AliExpress:", error);
    return NextResponse.json(
      { error: "Error interno importando el producto de AliExpress." },
      { status: 500 }
    );
  }
}

