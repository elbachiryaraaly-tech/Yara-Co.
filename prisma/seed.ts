import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ADMIN_EMAIL = "admin@yaraandco.com";
const ADMIN_DEFAULT_PASSWORD = "Admin123!"; // Cambiar en producción

async function main() {
  // Usuario administrador (para acceder a /admin)
  const adminPassword = process.env.ADMIN_PASSWORD?.trim() || ADMIN_DEFAULT_PASSWORD;
  const hashed = await bcrypt.hash(adminPassword, 10);
  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { role: "ADMIN", password: hashed, emailVerified: new Date() },
    create: {
      email: ADMIN_EMAIL,
      name: "Administrador",
      password: hashed,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  // Categories
  const catPerfumes = await prisma.category.upsert({
    where: { slug: "perfumes" },
    update: {},
    create: { name: "Perfumes", slug: "perfumes", description: "Fragancias de lujo", order: 0 },
  });
  const catRelojes = await prisma.category.upsert({
    where: { slug: "relojes" },
    update: {},
    create: { name: "Relojes", slug: "relojes", description: "Relojes premium", order: 1 },
  });
  const catJoyeria = await prisma.category.upsert({
    where: { slug: "joyeria" },
    update: {},
    create: { name: "Joyería", slug: "joyeria", description: "Joyería exclusiva", order: 2 },
  });
  const catAccesorios = await prisma.category.upsert({
    where: { slug: "accesorios" },
    update: {},
    create: { name: "Accesorios", slug: "accesorios", description: "Accesorios de piel y lujo", order: 3 },
  });

  // Proveedores dropshipping: CJDropshipping con API Key desde .env
  const cjApiKey = process.env.CJ_API_KEY?.trim() || undefined;
  const cj = await prisma.dropshippingProvider.findFirst({ where: { name: "CJDropshipping" } });
  if (cj) {
    await prisma.dropshippingProvider.update({
      where: { id: cj.id },
      data: { code: "cj", apiKey: cjApiKey ?? cj.apiKey, isActive: true },
    });
  } else {
    await prisma.dropshippingProvider.create({
      data: { name: "CJDropshipping", code: "cj", apiKey: cjApiKey, isActive: true },
    });
  }
  // AliExpress: App Key + App Secret desde .env
  const aliexpressAppKey = process.env.ALIEXPRESS_APP_KEY?.trim() || undefined;
  const aliexpressAppSecret = process.env.ALIEXPRESS_APP_SECRET?.trim() || undefined;
  const aliexpress = await prisma.dropshippingProvider.findFirst({ where: { name: "AliExpress" } });
  if (aliexpress) {
    await prisma.dropshippingProvider.update({
      where: { id: aliexpress.id },
      data: {
        code: "aliexpress",
        apiKey: aliexpressAppKey ?? aliexpress.apiKey,
        apiSecret: aliexpressAppSecret ?? aliexpress.apiSecret,
        isActive: true,
      },
    });
  } else {
    await prisma.dropshippingProvider.create({
      data: {
        name: "AliExpress",
        code: "aliexpress",
        apiKey: aliexpressAppKey,
        apiSecret: aliexpressAppSecret,
        isActive: true,
      },
    });
  }
  // Printful: Private Token en Admin → Proveedores → Configurar API → Access Token (o PRINTFUL_ACCESS_TOKEN en .env)
  const printfulToken = process.env.PRINTFUL_ACCESS_TOKEN?.trim() || undefined;
  const printful = await prisma.dropshippingProvider.findFirst({ where: { code: "printful" } });
  if (printful) {
    await prisma.dropshippingProvider.update({
      where: { id: printful.id },
      data: { name: "Printful", code: "printful", accessToken: printfulToken ?? printful.accessToken, isActive: true },
    });
  } else {
    await prisma.dropshippingProvider.create({
      data: { name: "Printful", code: "printful", accessToken: printfulToken, isActive: true },
    });
  }
  // Resto de proveedores si no existen
  const names = ["Proveedor demo"];
  for (const name of names) {
    const exists = await prisma.dropshippingProvider.findFirst({ where: { name } });
    if (!exists) {
      await prisma.dropshippingProvider.create({ data: { name, isActive: true } });
    }
  }

  const products = [
    {
      name: "Eau de Parfum Midnight Oud",
      slug: "eau-de-parfum-midnight-oud",
      description: "Fragancia intensa con notas de oud, ámbar y especias.",
      shortDescription: "Oud y ámbar para una presencia inolvidable.",
      price: 89.99,
      compareAtPrice: 119.99,
      categoryId: catPerfumes.id,
      isFeatured: true,
      badges: ["NUEVO"],
      rating: 4.8,
      reviewCount: 124,
      stock: 50,
      images: ["https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80"],
    },
    {
      name: "Reloj Cronógrafo Luna Nova",
      slug: "reloj-cronografo-luna-nova",
      description: "Cronógrafo suizo de edición limitada.",
      shortDescription: "Precisión y diseño atemporal.",
      price: 299.99,
      compareAtPrice: null,
      categoryId: catRelojes.id,
      isFeatured: true,
      badges: ["EXCLUSIVO"],
      rating: 4.9,
      reviewCount: 89,
      stock: 20,
      images: ["https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80"],
    },
    {
      name: "Collar Oro Rosa con Diamantes",
      slug: "collar-oro-rosa-diamantes",
      description: "Collar en oro rosa con incrustaciones de diamantes.",
      shortDescription: "Elegancia atemporal.",
      price: 199.99,
      compareAtPrice: 249.99,
      categoryId: catJoyeria.id,
      isFeatured: true,
      badges: ["-20%"],
      rating: 4.7,
      reviewCount: 56,
      stock: 15,
      images: ["https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80"],
    },
    {
      name: "Cartera de Piel Italiana",
      slug: "cartera-piel-italiana",
      description: "Cartera de piel de ternera italiana, acabado artesanal.",
      shortDescription: "Piel italiana de máxima calidad.",
      price: 149.99,
      compareAtPrice: null,
      categoryId: catAccesorios.id,
      isFeatured: true,
      badges: [],
      rating: 4.6,
      reviewCount: 203,
      stock: 40,
      images: ["https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&q=80"],
    },
    {
      name: "Perfume Flor de Noche",
      slug: "perfume-flor-de-noche",
      description: "Floral oriental con notas de jazmín y vainilla.",
      shortDescription: "Misterio y seducción.",
      price: 79.99,
      compareAtPrice: 99.99,
      categoryId: catPerfumes.id,
      isFeatured: true,
      badges: ["NUEVO"],
      rating: 4.5,
      reviewCount: 78,
      stock: 60,
      images: ["https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80"],
    },
  ];

  for (const p of products) {
    const { images, ...data } = p;
    const createData = {
      ...data,
      badges: typeof data.badges === "string" ? data.badges : JSON.stringify(data.badges ?? []),
      tags: typeof (data as { tags?: string[] }).tags === "string" ? (data as { tags?: string }).tags : JSON.stringify((data as { tags?: string[] }).tags ?? []),
    };
    const product = await prisma.product.upsert({
      where: { slug: data.slug },
      update: {},
      create: createData,
    });
    const existingImages = await prisma.productImage.count({ where: { productId: product.id } });
    if (existingImages === 0) {
      await prisma.productImage.createMany({
        data: images.map((url, i) => ({ url, alt: data.name, order: i, productId: product.id })),
      });
    }
  }

  console.log("Seed completado: categorías, proveedores y productos creados.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
