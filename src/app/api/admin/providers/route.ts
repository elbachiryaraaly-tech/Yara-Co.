import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const providers = await prisma.dropshippingProvider.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, isActive: true, apiKey: true },
    });
    return NextResponse.json(providers);
  } catch (e) {
    console.error("GET /api/admin/providers", e);
    return NextResponse.json({ error: "Error al listar proveedores" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: "El nombre del proveedor es obligatorio (mín. 2 caracteres)." },
        { status: 400 }
      );
    }
    const provider = await prisma.dropshippingProvider.create({
      data: {
        name,
        isActive: body.isActive !== false,
      },
    });
    return NextResponse.json(provider);
  } catch (e) {
    console.error("POST /api/admin/providers", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al crear el proveedor" },
      { status: 500 }
    );
  }
}
