import { NextResponse } from "next/server";
import { retryFailedDropshipping } from "@/lib/cron-tasks";

/**
 * Reintenta automáticamente enviar al proveedor los pedidos PAID que no tienen providerOrderId.
 * Llamar por cron (ej. cada 15–30 min). Authorization: Bearer <CRON_SECRET> o ?secret=<CRON_SECRET>.
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
    return NextResponse.json({ ok: true, message: "CRON_SECRET no configurado; nada que ejecutar." });
  }

  try {
    const result = await retryFailedDropshipping();
    return NextResponse.json({
      ok: true,
      retried: result.retried,
      success: result.success,
      failed: result.failed,
      ...(result.errors.length > 0 && { errors: result.errors }),
    });
  } catch (e) {
    console.error("[retry-dropshipping]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al reintentar envíos" },
      { status: 500 }
    );
  }
}
