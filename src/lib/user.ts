import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true },
  });
}

export async function getUserOrders(limit = 20) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];
  return prisma.order.findMany({
    where: { userId: session.user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getUserOrderById(orderId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: session.user.id },
    include: {
      items: { include: { product: { select: { name: true, slug: true } } } },
      shippingAddress: true,
    },
  });
  return order;
}
