import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const UPLOAD_DIR = "public/uploads/productos";
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const role = (session.user as { role?: string }).role;
    if (role !== "ADMIN") {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      });
      if (user?.role !== "ADMIN") {
        return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
      }
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Envía un archivo con el campo 'file'" },
        { status: 400 }
      );
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json(
        { error: "Solo imágenes: JPEG, PNG, WebP o GIF" },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Tamaño máximo 5 MB" },
        { status: 400 }
      );
    }

    const ext = path.extname(file.name) || ".jpg";
    const safeExt = [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext.toLowerCase())
      ? ext.toLowerCase()
      : ".jpg";
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${safeExt}`;
    const dir = path.join(process.cwd(), UPLOAD_DIR);
    await mkdir(dir, { recursive: true });
    const filePath = path.join(dir, name);
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    const url = `/uploads/productos/${name}`;
    return NextResponse.json({ url });
  } catch (e) {
    console.error("POST /api/admin/upload", e);
    return NextResponse.json(
      { error: "Error al subir el archivo" },
      { status: 500 }
    );
  }
}
