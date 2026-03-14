import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = typeof body.token === "string" ? body.token.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!token) {
      return NextResponse.json({ error: "Falta el token" }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "La nueva contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    const row = await prisma.verificationToken.findUnique({
      where: { token },
    });
    if (!row || !row.identifier.startsWith("reset:")) {
      return NextResponse.json(
        { error: "Enlace inválido o ya usado" },
        { status: 400 }
      );
    }
    if (row.expires < new Date()) {
      await prisma.verificationToken.delete({ where: { token } }).catch(() => {});
      return NextResponse.json(
        { error: "Enlace caducado. Solicita uno nuevo." },
        { status: 400 }
      );
    }

    const email = row.identifier.replace(/^reset:/, "");
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      await prisma.verificationToken.delete({ where: { token } }).catch(() => {});
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 400 }
      );
    }

    const hashed = await hashPassword(password);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashed },
      }),
      prisma.verificationToken.delete({ where: { token } }),
    ]);

    return NextResponse.json({
      ok: true,
      message: "Contraseña actualizada. Ya puedes iniciar sesión.",
    });
  } catch (e) {
    console.error("[POST /api/auth/reset-password]", e);
    return NextResponse.json(
      { error: "Error al actualizar la contraseña" },
      { status: 500 }
    );
  }
}

