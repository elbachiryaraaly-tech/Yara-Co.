import { CheckoutSuccessClient } from "@/components/checkout/CheckoutSuccessClient";
import { completeOrderFromSessionId } from "@/lib/stripe-complete-order";

type Props = {
  searchParams: Promise<{ session_id?: string }>;
};

/**
 * Página de éxito tras el pago con Stripe.
 * El pedido se completa en el servidor al cargar esta página (flujo 100% automático),
 * sin depender del JavaScript del cliente.
 */
export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams;
  let orderId: string | null = null;
  let error: string | null = null;

  if (session_id) {
    const result = await completeOrderFromSessionId(session_id);
    if (result.ok) orderId = result.orderId;
    else error = result.error;
  } else {
    error = "Sesión no encontrada";
  }

  return (
    <div className="min-h-[calc(100vh-var(--header-height,80px))] flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <CheckoutSuccessClient
          orderId={orderId}
          error={error}
          sessionId={session_id ?? null}
        />
      </div>
    </div>
  );
}
