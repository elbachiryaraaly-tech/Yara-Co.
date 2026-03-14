import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Guarda el access_token obtenido por flujo client-side (response_type=token).
 * POST body: { access_token: string, state?: string } (state = provider id).
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }
    const body = await req.json().catch(() => ({}));
    const access_token = typeof body.access_token === "string" ? body.access_token.trim() : null;
    const refresh_token = typeof body.refresh_token === "string" ? body.refresh_token.trim() : null;
    if (!access_token) {
      return NextResponse.json({ ok: false, error: "Falta access_token" }, { status: 400 });
    }
    const state = typeof body.state === "string" ? body.state.trim() : undefined;
    const provider = state
      ? await prisma.dropshippingProvider.findUnique({
          where: { id: state, code: "aliexpress" },
        })
      : await prisma.dropshippingProvider.findFirst({
          where: { code: "aliexpress" },
        });
    if (!provider) {
      return NextResponse.json({ ok: false, error: "Proveedor AliExpress no encontrado" }, { status: 404 });
    }
    await prisma.dropshippingProvider.update({
      where: { id: provider.id },
      data: {
        accessToken: access_token,
        ...(refresh_token ? { refreshToken: refresh_token } : {}),
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("POST /api/auth/aliexpress/save-token", e);
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Error al guardar" },
      { status: 500 }
    );
  }
}
