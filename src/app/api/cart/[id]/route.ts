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

async function canAccessCartItem(
  itemId: string,
  userId: string | null,
  sessionId: string | null
): Promise<boolean> {
  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
  });
  if (!item) return false;
  if (userId && item.userId === userId) return true;
  if (sessionId && item.sessionId === sessionId) return true;
  return false;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const cookieStore = await cookies();
    const sessionId = getSessionId(cookieStore.toString());
    const { id } = await params;
    const can = await canAccessCartItem(id, session?.user?.id ?? null, sessionId);
    if (!can) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
    const body = await req.json();
    const { quantity } = body as { quantity: number };
    if (quantity < 1) {
      await prisma.cartItem.delete({ where: { id } });
      return NextResponse.json({ ok: true });
    }
    await prisma.cartItem.update({
      where: { id },
      data: { quantity },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const cookieStore = await cookies();
    const sessionId = getSessionId(cookieStore.toString());
    const { id } = await params;
    const can = await canAccessCartItem(id, session?.user?.id ?? null, sessionId);
    if (!can) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
    await prisma.cartItem.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}
