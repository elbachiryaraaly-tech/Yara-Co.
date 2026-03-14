import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";

const RESET_EXPIRY_HOURS = 1;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const emailRaw = typeof body.email === "string" ? body.email.trim() : "";
    if (!emailRaw) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 });
    }

    const email = emailRaw.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({
        ok: true,
        message:
          "Si el correo existe en nuestra base de datos, te hemos enviado un enlace para restablecer tu contraseña.",
      });
    }

    const identifier = `reset:${email}`;
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + RESET_EXPIRY_HOURS * 60 * 60 * 1000);

    await prisma.verificationToken.deleteMany({ where: { identifier } });
    await prisma.verificationToken.create({
      data: { identifier, token, expires },
    });

    const { error } = await sendPasswordResetEmail({
      to: email,
      token,
      name: user.name,
    });
    if (error) {
      console.error("[forgot-password] Error enviando email", error);
    }

    return NextResponse.json({
      ok: true,
      message:
        "Si el correo existe en nuestra base de datos, te hemos enviado un enlace para restablecer tu contraseña.",
    });
  } catch (e) {
    console.error("[POST /api/auth/forgot-password]", e);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}

