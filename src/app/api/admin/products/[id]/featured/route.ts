import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * PATCH /api/admin/products/[id]/featured
 * Actualiza solo isFeatured del producto (para el toggle desde la tabla de admin).
 * Body: { isFeatured: boolean }
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const role = (session.user as { role?: string }).role;
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Solo administradores pueden modificar destacados" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const isFeatured = body?.isFeatured === true;

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    await prisma.product.update({
      where: { id },
      data: { isFeatured },
    });

    return NextResponse.json({ ok: true, isFeatured });
  } catch (e) {
    console.error("PATCH /api/admin/products/[id]/featured", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al actualizar destacado" },
      { status: 500 }
    );
  }
}
