/**
 * Script para importar un producto Shein por ID (sin sesión).
 * Uso: npx tsx scripts/import-shein-one.ts 39874170
 */
import { PrismaClient } from "@prisma/client";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// Cargar .env manualmente si existe (para que SEARCHAPI_API_KEY y DATABASE_URL estén disponibles)
function loadEnv() {
  const envPath = resolve(process.cwd(), ".env");
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const eq = trimmed.indexOf("=");
        if (eq > 0) {
          const key = trimmed.slice(0, eq).trim();
          let val = trimmed.slice(eq + 1).trim();
          if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
          if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
          if (!process.env[key]) process.env[key] = val;
        }
      }
    }
  }
  const localPath = resolve(process.cwd(), ".env.local");
  if (existsSync(localPath)) {
    const content = readFileSync(localPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const eq = trimmed.indexOf("=");
        if (eq > 0) {
          const key = trimmed.slice(0, eq).trim();
          let val = trimmed.slice(eq + 1).trim();
          if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
          if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
          process.env[key] = val;
        }
      }
    }
  }
}
loadEnv();

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

async function main() {
  const sheinProductId = process.argv[2]?.trim() || "39874170";
  const apiKey = process.env.SEARCHAPI_API_KEY?.trim();
  if (!apiKey) {
    console.error("Falta SEARCHAPI_API_KEY en .env o .env.local");
    process.exit(1);
  }

  const prisma = new PrismaClient();

  let provider = await prisma.dropshippingProvider.findFirst({ where: { code: "shein" } });
  if (!provider) {
    provider = await prisma.dropshippingProvider.create({
      data: { name: "Shein", code: "shein", isActive: true },
    });
    console.log("Proveedor Shein creado.");
  }

  const domains = ["es.shein.com", "us.shein.com", "roe.shein.com"];
  let productData: any = null;
  for (const domain of domains) {
    const url = `https://www.searchapi.io/api/v1/search?engine=shein_product&product_id=${sheinProductId}&api_key=${apiKey}&shein_domain=${domain}`;
    const res = await fetch(url);
    const json = await res.json();
    if (json.product?.title) {
      productData = json.product;
      console.log("Producto encontrado en", domain);
      break;
    }
    if (json.error) console.log(domain, ":", json.error);
  }

  if (!productData?.title) {
    console.error("No se encontró el producto", sheinProductId, "en Shein.");
    process.exit(1);
  }

  const name = productData.title;
  let slug = slugify(name);
  let suffix = 0;
  while (await prisma.product.findUnique({ where: { slug } })) {
    suffix++;
    slug = `${slugify(name)}-${suffix}`;
  }

  const costPrice = productData.extracted_price ?? 0;
  const compareAtPrice = (productData.extracted_original_price ?? costPrice * 1.2) * 1.5;
  const salePrice = costPrice * 2.0;
  const imageUrls = (productData.images?.length ? productData.images : productData.main_image ? [productData.main_image] : []).slice(0, 10);
  const sizeVariants = productData.variants?.size ?? [];
  const colorVariants = productData.variants?.colors ?? [];
  const hasSizes = sizeVariants.length > 0;
  const hasColors = colorVariants.length > 0;

  type V = { name: string; sku: string; providerVariantId: string; price: number; compareAtPrice: number; stock: number; imageUrl: string | null };
  const variants: V[] = [];

  if (hasSizes) {
    sizeVariants.forEach((s: any, i: number) => {
      const sizeVal = s.sale_attributes?.find((a: any) => a.name === "Size")?.value ?? `Size ${i + 1}`;
      variants.push({
        name: sizeVal,
        sku: `${productData.sku || sheinProductId}-${sizeVal.replace(/\s+/g, "-")}`,
        providerVariantId: `${sheinProductId}-${sizeVal}`,
        price: (s.extracted_price ?? costPrice) * 2,
        compareAtPrice: (s.extracted_original_price ?? costPrice) * 1.2,
        stock: s.stock ?? 10,
        imageUrl: null,
      });
    });
  } else if (hasColors) {
    colorVariants.forEach((c: any, i: number) => {
      const colorName = c.main_sale_attribute?.value ?? c.title ?? `Color ${i + 1}`;
      variants.push({
        name: colorName,
        sku: `${productData.sku || sheinProductId}-${i + 1}`,
        providerVariantId: c.product_id || `${sheinProductId}-${i + 1}`,
        price: (c.extracted_price ?? costPrice) * 2,
        compareAtPrice: (c.extracted_original_price ?? costPrice) * 1.2,
        stock: c.stock ?? 10,
        imageUrl: null,
      });
    });
  }
  if (variants.length === 0) {
    variants.push({
      name: "Único",
      sku: productData.sku || sheinProductId,
      providerVariantId: sheinProductId,
      price: salePrice,
      compareAtPrice,
      stock: productData.stock ?? 10,
      imageUrl: productData.main_image || null,
    });
  }

  const totalStock = variants.reduce((a, v) => a + v.stock, 0);
  const minPrice = Math.min(...variants.map((v) => v.price));
  const description = productData.specifications
    ? productData.specifications.map((s: any) => `${s.name}: ${s.value}`).join("\n")
    : `Importado de Shein (ID: ${sheinProductId})`;

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      description,
      shortDescription: productData.sku ? `SKU ${productData.sku}` : "Shein",
      price: minPrice,
      compareAtPrice: variants[0]?.compareAtPrice ?? compareAtPrice,
      costPrice,
      sku: productData.sku || sheinProductId,
      stock: totalStock,
      trackInventory: true,
      isActive: true,
      providerId: provider.id,
      providerProductId: sheinProductId,
    },
  });

  if (imageUrls.length > 0) {
    await prisma.productImage.createMany({
      data: imageUrls.map((url: string, i: number) => ({
        productId: product.id,
        url,
        alt: name,
        order: i,
      })),
    });
  }
  await prisma.productVariant.createMany({
    data: variants.map((v) => ({
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

  console.log("OK. Producto importado:", product.id, product.slug, name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => process.exit(0));
