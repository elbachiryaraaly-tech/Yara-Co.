import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { serializeProduct, serializeProducts } from "./serialize-product";

export async function getFeaturedProducts(limit = 8) {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      include: { images: { orderBy: { order: "asc" } } },
      take: limit,
      orderBy: { createdAt: "desc" },
    });
    return serializeProducts(products);
  } catch {
    return [];
  }
}

export async function getProducts(options: {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
}) {
  const { category, search, minPrice, maxPrice, sort = "newest", page = 1, limit = 12 } = options;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { isActive: true };
  if (category) {
    where.category = { slug: category };
  }
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }
  if (minPrice != null || maxPrice != null) {
    where.price = {};
    if (minPrice != null) (where.price as Record<string, number>).gte = minPrice;
    if (maxPrice != null) (where.price as Record<string, number>).lte = maxPrice;
  }

  const orderBy: Record<string, string> =
    sort === "price_asc"
      ? { price: "asc" }
      : sort === "price_desc"
        ? { price: "desc" }
        : sort === "rating"
          ? { rating: "desc" }
          : { createdAt: "desc" };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { images: { orderBy: { order: "asc" }, take: 1 } },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products: serializeProducts(products),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      images: { orderBy: { order: "asc" } },
      variants: true,
      category: true,
      reviews: { take: 10, include: { user: { select: { name: true, image: true } } } },
    },
  });
  if (!product) return null;
  return serializeProduct(product);
}

export async function getCategories() {
  return prisma.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: { order: "asc" },
    include: { children: { where: { isActive: true }, orderBy: { order: "asc" } } },
  });
}
