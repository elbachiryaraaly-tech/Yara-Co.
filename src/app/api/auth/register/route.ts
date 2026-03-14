import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";
import crypto from "crypto";

const bodySchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const VERIFICATION_EXPIRY_HOURS = 24;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = bodySchema.parse(body);
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con este email" },
        { status: 400 }
      );
    }
    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: "CUSTOMER",
        emailVerified: null,
      },
    });

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
      console.error("Register: fallo envío email verificación", emailError);
    }

    return NextResponse.json({
      ok: true,
      message: "Cuenta creada. Revisa tu correo para activar tu cuenta.",
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: e.errors.map((x) => x.message).join(", ") },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Error al crear la cuenta" },
      { status: 500 }
    );
  }
}
