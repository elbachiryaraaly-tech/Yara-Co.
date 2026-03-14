import { NextResponse } from "next/server";
import { syncTracking } from "@/lib/cron-tasks";
import { sendTrackingShippedEmail } from "@/lib/email";

/**
 * Sincroniza tracking con el proveedor y marca pedidos como SHIPPED.
 * Envía email automático al cliente cuando hay número de seguimiento.
 * Llamar por cron (ej. cada hora). Authorization: Bearer <CRON_SECRET> o ?secret=<CRON_SECRET>.
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
    const result = await syncTracking();

    for (const order of result.shipped) {
      try {
        await sendTrackingShippedEmail({
          to: order.email,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          trackingNumber: order.trackingNumber,
          trackingUrl: order.trackingUrl,
        });
      } catch (e) {
        console.error("[sync-tracking] Email tracking", order.orderNumber, e);
      }
    }

    return NextResponse.json({
      ok: true,
      checked: result.checked,
      updated: result.updated,
      emailsSent: result.shipped.length,
      ...(result.errors.length > 0 && { errors: result.errors }),
    });
  } catch (e) {
    console.error("[sync-tracking]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al sincronizar tracking" },
      { status: 500 }
    );
  }
}
