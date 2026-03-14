import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ items: [] });
  }
  const items = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        include: { images: { take: 1, orderBy: { order: "asc" } } },
      },
    },
  });
  const out = items.map((i) => ({
    id: i.id,
    productId: i.productId,
    product: {
      id: i.product.id,
      name: i.product.name,
      slug: i.product.slug,
      price: Number(i.product.price),
      compareAtPrice: i.product.compareAtPrice ? Number(i.product.compareAtPrice) : null,
      image: i.product.images[0]?.url ?? null,
      badge: (() => { const b = i.product.badges; const arr = typeof b === "string" ? (() => { try { return JSON.parse(b); } catch { return []; } })() : (Array.isArray(b) ? b : []); return arr[0] ?? null; })(),
      rating: i.product.rating ? Number(i.product.rating) : null,
      reviewCount: i.product.reviewCount,
    },
  }));
  return NextResponse.json({ items: out });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const body = await req.json();
  const { productId } = body as { productId?: string };
  if (!productId) {
    return NextResponse.json({ error: "productId requerido" }, { status: 400 });
  }
  await prisma.wishlistItem.upsert({
    where: {
      userId_productId: { userId: session.user.id, productId },
    },
    create: { userId: session.user.id, productId },
    update: {},
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  if (!productId) {
    return NextResponse.json({ error: "productId requerido" }, { status: 400 });
  }
  await prisma.wishlistItem.deleteMany({
    where: { userId: session.user.id, productId },
  });
  return NextResponse.json({ ok: true });
}
