import { NextResponse } from "next/server";
import {
  refreshAliExpressTokens,
  retryFailedDropshipping,
  syncTracking,
} from "@/lib/cron-tasks";
import { sendTrackingShippedEmail } from "@/lib/email";

/**
 * Cron unificado: ejecuta todo el flujo automático en un solo request.
 * Orden: 1) Renovar token AliExpress  2) Reintentar dropshipping fallidos  3) Sincronizar tracking y enviar emails.
 *
 * Configura UN solo cron que llame a GET /api/cron/run con Authorization: Bearer <CRON_SECRET>
 * o ?secret=<CRON_SECRET>. Recomendado: cada hora.
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
      message: "CRON_SECRET no configurado. Añade CRON_SECRET en .env y configura un cron a /api/cron/run",
    });
  }

  const report: {
    refresh: { refreshed: number; total: number };
    retry: { retried: number; success: number; failed: number };
    sync: { checked: number; updated: number; emailsSent: number };
    errors?: string[];
  } = {
    refresh: { refreshed: 0, total: 0 },
    retry: { retried: 0, success: 0, failed: 0 },
    sync: { checked: 0, updated: 0, emailsSent: 0 },
  };
  const allErrors: string[] = [];

  try {
    // 1) Renovar tokens AliExpress
    const refreshResult = await refreshAliExpressTokens();
    report.refresh = { refreshed: refreshResult.refreshed, total: refreshResult.total };
    refreshResult.results.filter((r) => !r.ok).forEach((r) => allErrors.push(`AliExpress ${r.name}: ${r.error}`));

    // 2) Reintentar pedidos PAID sin providerOrderId
    const retryResult = await retryFailedDropshipping();
    report.retry = {
      retried: retryResult.retried,
      success: retryResult.success,
      failed: retryResult.failed,
    };
    allErrors.push(...retryResult.errors);

    // 3) Sincronizar tracking y enviar emails
    const syncResult = await syncTracking();
    report.sync = {
      checked: syncResult.checked,
      updated: syncResult.updated,
      emailsSent: 0,
    };
    allErrors.push(...syncResult.errors);

    for (const order of syncResult.shipped) {
      try {
        await sendTrackingShippedEmail({
          to: order.email,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          trackingNumber: order.trackingNumber,
          trackingUrl: order.trackingUrl,
        });
        report.sync.emailsSent++;
      } catch (e) {
        console.error("[cron/run] Email tracking", order.orderNumber, e);
      }
    }

    return NextResponse.json({
      ok: true,
      report,
      ...(allErrors.length > 0 && { errors: allErrors.slice(0, 40) }),
    });
  } catch (e) {
    console.error("[cron/run]", e);
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Error en cron unificado", report },
      { status: 500 }
    );
  }
}
