import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getWishlistItems() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];
  const items = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        include: { images: { take: 1, orderBy: { order: "asc" } } },
      },
    },
  });
  return items.map((i) => ({
    id: i.id,
    productId: i.productId,
    product: {
      id: i.product.id,
      name: i.product.name,
      slug: i.product.slug,
      price: Number(i.product.price),
      compareAtPrice: i.product.compareAtPrice ? Number(i.product.compareAtPrice) : null,
      image: i.product.images[0]?.url ?? null,
      badge: i.product.badges[0] ?? null,
      rating: i.product.rating ? Number(i.product.rating) : null,
      reviewCount: i.product.reviewCount,
    },
  }));
}
