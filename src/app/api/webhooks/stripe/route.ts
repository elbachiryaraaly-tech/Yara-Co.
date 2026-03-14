import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import {
  completeOrderAfterPayment,
  PaymentVerificationError,
} from "@/lib/stripe-complete-order";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }
  if (!webhookSecret) {
    console.error("[Stripe Webhook] STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret required. Use Stripe CLI in dev or set STRIPE_WEBHOOK_SECRET in production." },
      { status: 503 }
    );
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (e) {
    const err = e as Error;
    console.error("[Stripe Webhook] Signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const orderId = session.metadata?.orderId;

  if (!orderId) {
    console.error("[Stripe Webhook] checkout.session.completed without orderId in metadata");
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  }

  try {
    await completeOrderAfterPayment({ orderId, session });
    return NextResponse.json({ received: true });
  } catch (e) {
    if (e instanceof PaymentVerificationError) {
      console.error("[Stripe Webhook] Verification failed:", e.message);
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    console.error("[Stripe Webhook] Error processing checkout.session.completed:", e);
    return NextResponse.json(
      { error: "Processing failed" },
      { status: 500 }
    );
  }
}
