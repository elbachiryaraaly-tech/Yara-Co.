import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { refreshAliExpressProviderToken } from "@/lib/aliexpress-refresh";

/**
 * Renueva el access_token de AliExpress antes de que caduque (duración ~1 día).
 * Llamar por cron cada 12 horas (o 1 vez al día) para que todo sea automático.
 *
 * Protección: Authorization: Bearer <CRON_SECRET> o ?secret=<CRON_SECRET>.
 * Si CRON_SECRET no está definido, la ruta no hace nada.
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const querySecret = new URL(req.url).searchParams.get("secret");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && token !== cronSecret && querySecret !== cronSecret) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!cronSecret) {
    return NextResponse.json({
      ok: true,
      message: "CRON_SECRET no configurado; nada que ejecutar.",
    });
  }

  try {
    const providers = await prisma.dropshippingProvider.findMany({
      where: {
        code: "aliexpress",
        refreshToken: { not: null },
        apiKey: { not: null },
        apiSecret: { not: null },
        isActive: true,
      },
      select: { id: true, name: true },
    });

    const results: { id: string; name: string; ok: boolean; error?: string }[] = [];

    for (const p of providers) {
      const result = await refreshAliExpressProviderToken(p.id);
      results.push({
        id: p.id,
        name: p.name,
        ok: result.ok,
        ...(result.ok ? {} : { error: result.error }),
      });
    }

    const refreshed = results.filter((r) => r.ok).length;
    return NextResponse.json({
      ok: true,
      refreshed,
      total: providers.length,
      results,
    });
  } catch (e) {
    console.error("[refresh-aliexpress-token]", e);
    return NextResponse.json(
      {
        error: e instanceof Error ? e.message : "Error al renovar token AliExpress",
      },
      { status: 500 }
    );
  }
}
