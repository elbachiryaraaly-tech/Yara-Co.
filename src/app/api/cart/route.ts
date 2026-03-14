import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

const CART_SESSION_COOKIE = "cart_session_id";

function getSessionId(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${CART_SESSION_COOKIE}=([^;]+)`));
  return match ? match[1] : null;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const cookieStore = await cookies();
    const sessionId = session?.user ? null : getSessionId(cookieStore.toString()) ?? null;

    const where = session?.user
      ? { userId: session.user.id }
      : sessionId
        ? { sessionId }
        : null;

    if (!where) {
      return NextResponse.json({ items: [] });
    }

    const items = await prisma.cartItem.findMany({
      where,
      include: {
        product: {
          include: { images: { take: 1, orderBy: { order: "asc" } } },
        },
      },
    });

    const out = items.map((i) => ({
      id: i.id,
      productId: i.productId,
      variantId: i.variantId,
      quantity: i.quantity,
      name: i.product.name,
      slug: i.product.slug,
      price: Number(i.product.price),
      image: i.product.images[0]?.url ?? null,
    }));
    return NextResponse.json({ items: out });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ items: [] });
  }
}

async function getOrCreateCartOwner(
  userId: string | null,
  sessionId: string | null
): Promise<{ userId?: string; sessionId?: string }> {
  if (userId) return { userId };
  if (sessionId) return { sessionId };
  const newId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  return { sessionId: newId };
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const cookieStore = await cookies();
    const sessionIdFromCookie = getSessionId(cookieStore.toString());
    const { userId, sessionId } = await getOrCreateCartOwner(
      session?.user?.id ?? null,
      sessionIdFromCookie
    );

    const body = await req.json();
    const { productId, variantId, quantity = 1 } = body as {
      productId?: string;
      variantId?: string | null;
      quantity?: number;
    };
    if (!productId || quantity < 1) {
      return NextResponse.json(
        { error: "productId y quantity requeridos" },
        { status: 400 }
      );
    }

    const where = userId ? { userId } : { sessionId: sessionId! };
    const existing = await prisma.cartItem.findFirst({
      where: {
        ...where,
        productId,
        variantId: variantId ?? null,
      },
    });

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          ...where,
          productId,
          variantId: variantId ?? null,
          quantity,
        },
      });
    }

    const res = NextResponse.json({ ok: true });
    if (sessionId && !sessionIdFromCookie) {
      res.headers.set("Set-Cookie", `${CART_SESSION_COOKIE}=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`);
    }
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al añadir al carrito" }, { status: 500 });
  }
}
