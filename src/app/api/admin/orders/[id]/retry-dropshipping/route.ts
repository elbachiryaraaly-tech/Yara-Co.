import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { submitOrderToProvider } from "@/lib/dropshipping/submitOrderToProvider";

/**
 * Reintenta enviar el pedido al proveedor de dropshipping.
 * Útil cuando el envío automático falló o el pedido quedó sin providerOrderId.
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const { id: orderId } = await params;
    if (!orderId) {
      return NextResponse.json({ error: "ID de pedido requerido" }, { status: 400 });
    }

    const result = await submitOrderToProvider(orderId, {
      attemptNumber: 1,
      skipIfAlreadySent: false,
    });

    if (result.success) {
      return NextResponse.json({
        ok: true,
        message: "Pedido enviado al proveedor correctamente",
        logId: result.logId,
      });
    }

    return NextResponse.json(
      {
        ok: false,
        error: result.error ?? "No se pudo enviar al proveedor",
        logId: result.logId,
      },
      { status: 400 }
    );
  } catch (e) {
    console.error("[retry-dropshipping]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al reintentar envío" },
      { status: 500 }
    );
  }
}
