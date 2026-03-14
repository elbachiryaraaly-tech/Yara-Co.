import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { ArrowLeft } from "lucide-react";

export default async function CheckoutPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/checkout");
  }

  return (
    <div className="min-h-[calc(100vh-var(--header-height,80px))]">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <Link
          href="/carrito"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-[var(--gold)] transition-colors mb-10"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al carrito
        </Link>
        <div className="mb-10">
          <p className="text-[var(--gold)] text-sm uppercase tracking-[0.2em] mb-2">
            Finalizar compra
          </p>
          <h1 className="font-display text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
            Checkout
          </h1>
          <p className="mt-2 text-muted-foreground max-w-xl">
            Introduce tu dirección de envío y elige cómo quieres recibir tu pedido.
          </p>
        </div>
        <CheckoutForm />
      </div>
    </div>
  );
}
