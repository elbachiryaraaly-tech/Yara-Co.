import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const { id } = await params;
    const provider = await prisma.dropshippingProvider.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        code: true,
        isActive: true,
        apiKey: true,
        apiSecret: true,
        accessToken: true,
        baseUrl: true,
      },
    });
    if (!provider) {
      return NextResponse.json({ error: "Proveedor no encontrado" }, { status: 404 });
    }
    return NextResponse.json(provider);
  } catch (e) {
    console.error("GET /api/admin/providers/[id]", e);
    return NextResponse.json({ error: "Error al obtener el proveedor" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const data: {
      name?: string;
      code?: string | null;
      apiKey?: string | null;
      apiSecret?: string | null;
      accessToken?: string | null;
      baseUrl?: string | null;
      isActive?: boolean;
    } = {};
    if (typeof body.name === "string" && body.name.trim().length >= 2) {
      data.name = body.name.trim();
    }
    if (body.code !== undefined) {
      data.code = body.code === "" || body.code == null ? null : String(body.code).trim();
    }
    if (body.apiKey !== undefined) {
      data.apiKey = body.apiKey === "" || body.apiKey == null ? null : String(body.apiKey).trim();
    }
    if (body.apiSecret !== undefined) {
      data.apiSecret = body.apiSecret === "" || body.apiSecret == null ? null : String(body.apiSecret).trim();
    }
    if (body.accessToken !== undefined) {
      data.accessToken = body.accessToken === "" || body.accessToken == null ? null : String(body.accessToken).trim();
    }
    if (body.baseUrl !== undefined) {
      data.baseUrl = body.baseUrl === "" || body.baseUrl == null ? null : String(body.baseUrl).trim();
    }
    if (typeof body.isActive === "boolean") {
      data.isActive = body.isActive;
    }
    const provider = await prisma.dropshippingProvider.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        code: true,
        isActive: true,
        apiKey: true,
        baseUrl: true,
      },
    });
    return NextResponse.json(provider);
  } catch (e) {
    console.error("PATCH /api/admin/providers/[id]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al actualizar el proveedor" },
      { status: 500 }
    );
  }
}
