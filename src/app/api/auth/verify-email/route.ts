import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  if (!token) {
    return NextResponse.json(
      { error: "Falta el enlace de verificación" },
      { status: 400 }
    );
  }
  const row = await prisma.verificationToken.findUnique({
    where: { token },
  });
  if (!row) {
    return NextResponse.json(
      { error: "Enlace inválido o ya usado" },
      { status: 400 }
    );
  }
  if (row.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token } }).catch(() => {});
    return NextResponse.json(
      { error: "Enlace caducado. Solicita uno nuevo desde el login." },
      { status: 400 }
    );
  }
  const user = await prisma.user.findUnique({
    where: { email: row.identifier },
  });
  if (!user) {
    await prisma.verificationToken.delete({ where: { token } }).catch(() => {});
    return NextResponse.json(
      { error: "Usuario no encontrado" },
      { status: 400 }
    );
  }
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    }),
    prisma.verificationToken.delete({ where: { token } }),
  ]);
  return NextResponse.json({
    ok: true,
    message: "Correo verificado. Ya puedes iniciar sesión.",
  });
}
