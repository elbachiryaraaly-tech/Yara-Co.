import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import crypto from "crypto";

const bodySchema = z.object({
  email: z.string().email(),
});

const VERIFICATION_EXPIRY_HOURS = 24;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = bodySchema.parse(body);
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return NextResponse.json(
        { error: "No hay ninguna cuenta con este correo." },
        { status: 400 }
      );
    }
    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Esta cuenta ya está verificada. Puedes iniciar sesión." },
        { status: 400 }
      );
    }
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000);
    await prisma.verificationToken.deleteMany({ where: { identifier: email } });
    await prisma.verificationToken.create({
      data: { identifier: email, token, expires },
    });
    const { error: emailError } = await sendVerificationEmail({
      to: email,
      token,
      name: user.name,
    });
    if (emailError) {
      return NextResponse.json(
        { error: "No pudimos enviar el correo. Inténtalo más tarde." },
        { status: 500 }
      );
    }
    return NextResponse.json({
      ok: true,
      message: "Hemos enviado un nuevo correo de verificación.",
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Email no válido" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Error al reenviar el correo" },
      { status: 500 }
    );
  }
}
