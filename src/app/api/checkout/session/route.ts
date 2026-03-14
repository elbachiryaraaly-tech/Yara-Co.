import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import {
  completeOrderAfterPayment,
  PaymentVerificationError,
} from "@/lib/stripe-complete-order";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");
  if (!sessionId || !stripe) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });
    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }
    const orderId = session.metadata?.orderId;
    if (!orderId) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    try {
      await completeOrderAfterPayment({ orderId, session });
    } catch (e) {
      if (e instanceof PaymentVerificationError) {
        return NextResponse.json({ error: e.message }, { status: 400 });
      }
      throw e;
    }
    return NextResponse.json({ orderId });
  } catch (e) {
    console.error("[GET /api/checkout/session]", e);
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }
}
