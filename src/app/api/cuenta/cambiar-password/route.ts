import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { z } from "zod";

const bodySchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { currentPassword, newPassword } = bodySchema.parse(body);
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (!user?.password) {
      return NextResponse.json(
        { error: "No tienes contraseña configurada" },
        { status: 400 }
      );
    }
    const ok = await verifyPassword(currentPassword, user.password);
    if (!ok) {
      return NextResponse.json(
        { error: "Contraseña actual incorrecta" },
        { status: 400 }
      );
    }
    const hashed = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashed },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: e.errors.map((x) => x.message).join(", ") },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Error al actualizar contraseña" }, { status: 500 });
  }
}
