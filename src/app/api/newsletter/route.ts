import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const bodySchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = bodySchema.parse(body);
    await prisma.emailSubscriber.upsert({
      where: { email },
      create: { email, isActive: true },
      update: { isActive: true },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Email no válido" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Error al suscribirse" },
      { status: 500 }
    );
  }
}
