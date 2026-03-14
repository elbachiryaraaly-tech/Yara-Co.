import Stripe from "stripe";

const secret = process.env.STRIPE_SECRET_KEY;
export const stripe =
  secret && secret.startsWith("sk_")
    ? new Stripe(secret)
    : null;

export const stripeEnabled = Boolean(stripe);
