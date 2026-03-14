import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const bodySchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
});

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const data = bodySchema.parse(body);
    const update: { name?: string; email?: string } = {};
    if (data.name !== undefined) update.name = data.name;
    if (data.email !== undefined) {
      const existing = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existing && existing.id !== session.user.id) {
        return NextResponse.json(
          { error: "Ya existe una cuenta con este email" },
          { status: 400 }
        );
      }
      update.email = data.email;
    }
    await prisma.user.update({
      where: { id: session.user.id },
      data: update,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: e.errors.map((x) => x.message).join(", ") },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}
