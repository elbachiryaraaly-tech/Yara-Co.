import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { submitOrderToProvider } from "@/lib/dropshipping/submitOrderToProvider";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { stripe } from "@/lib/stripe";

export class PaymentVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaymentVerificationError";
  }
}

/**
 * Marca el pedido como PAID, crea el Payment, vacía el carrito y lanza dropshipping.
 * Idempotente: si el pedido ya está PAID, no hace nada.
 * Verifica que el importe cobrado por Stripe coincida con el pedido (seguridad).
 */
export async function completeOrderAfterPayment(params: {
  orderId: string;
  session: Stripe.Checkout.Session;
}) {
  const { orderId, session } = params;
  const userId = session.metadata?.userId ?? undefined;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, status: true, total: true, currency: true },
  });
  if (!order) throw new PaymentVerificationError("Order not found");
  if (order.status !== "PENDING") return;

  const orderTotalCents = Math.round(Number(order.total) * 100);
  const stripeAmount = session.amount_total;
  if (stripeAmount != null && stripeAmount !== orderTotalCents) {
    console.error("[completeOrderAfterPayment] Amount mismatch", {
      orderId,
      orderTotalCents,
      stripeAmount,
    });
    throw new PaymentVerificationError("Payment amount does not match order");
  }

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent as { id?: string })?.id ?? session.id;

  await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: { status: "PAID" },
    }),
    prisma.payment.create({
      data: {
        orderId,
        amount: order.total,
        currency: order.currency,
        provider: "stripe",
        providerPaymentId: paymentIntentId,
        status: "COMPLETED",
        metadata: JSON.stringify({ sessionId: session.id }),
      },
    }),
  ]);

  if (userId) {
    await prisma.cartItem.deleteMany({ where: { userId } });
  }

  try {
    await submitOrderToProvider(orderId, { attemptNumber: 1, skipIfAlreadySent: true });
  } catch (e) {
    console.error("[completeOrderAfterPayment] Dropshipping error for order", orderId, e);
  }

  try {
    const fullOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { product: true } },
        shippingAddress: true,
        user: { select: { name: true } },
      },
    });
    if (fullOrder?.email) {
      await sendOrderConfirmationEmail({
        to: fullOrder.email,
        orderNumber: fullOrder.orderNumber,
        customerName: fullOrder.user?.name ?? null,
        total: Number(fullOrder.total),
        currency: fullOrder.currency,
        items: fullOrder.items.map((i) => ({
          name: i.product.name,
          quantity: i.quantity,
          price: Number(i.price),
        })),
        shippingAddress: fullOrder.shippingAddress
          ? {
              address1: fullOrder.shippingAddress.address1,
              city: fullOrder.shippingAddress.city,
              zip: fullOrder.shippingAddress.zip,
              country: fullOrder.shippingAddress.country,
            }
          : null,
      });
    }
  } catch (e) {
    console.error("[completeOrderAfterPayment] Order confirmation email error", orderId, e);
  }
}

/**
 * Obtiene la sesión de Stripe y completa el pedido si está pagado.
 * Pensado para ejecutarse en el servidor al cargar la página de éxito (flujo 100% automático).
 * Idempotente: si el pedido ya está PAID, no hace nada y devuelve orderId.
 */
export async function completeOrderFromSessionId(sessionId: string): Promise<
  | { ok: true; orderId: string }
  | { ok: false; error: string }
> {
  if (!stripe) return { ok: false, error: "Stripe no configurado" };
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });
    if (session.payment_status !== "paid") {
      return { ok: false, error: "El pago no está completado" };
    }
    const orderId = session.metadata?.orderId;
    if (!orderId) return { ok: false, error: "Pedido no encontrado en la sesión" };
    try {
      await completeOrderAfterPayment({ orderId, session });
    } catch (e) {
      if (e instanceof PaymentVerificationError) {
        return { ok: false, error: e.message };
      }
      throw e;
    }
    return { ok: true, orderId };
  } catch (e) {
    console.error("[completeOrderFromSessionId]", e);
    return { ok: false, error: e instanceof Error ? e.message : "No se pudo verificar la sesión" };
  }
}
