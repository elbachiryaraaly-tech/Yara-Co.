"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";

const AUTO_REDIRECT_SECONDS = 4;

type Props = {
  /** Ya resuelto en el servidor: pedido completado */
  orderId: string | null;
  /** Si el servidor devolvió error (o no hay session_id) */
  error: string | null;
  /** Por si el cliente quiere reintentar vía API */
  sessionId: string | null;
};

export function CheckoutSuccessClient({ orderId: initialOrderId, error: initialError, sessionId }: Props) {
  const [orderId, setOrderId] = useState<string | null>(initialOrderId);
  const [error, setError] = useState<string | null>(initialError);
  const [retrying, setRetrying] = useState(false);
  const router = useRouter();

  // Reintento desde el cliente si el servidor falló pero tenemos session_id
  const retry = () => {
    if (!sessionId || retrying) return;
    setRetrying(true);
    setError(null);
    fetch(`/api/checkout/session?session_id=${encodeURIComponent(sessionId)}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.orderId) {
          setOrderId(data.orderId);
          setError(null);
        } else {
          setError(data.error ?? "No se pudo verificar el pago");
        }
      })
      .catch(() => setError("Error de conexión"))
      .finally(() => setRetrying(false));
  };

  // Redirección automática al detalle del pedido cuando el pago está confirmado
  useEffect(() => {
    if (!orderId) return;
    const t = setTimeout(() => {
      router.replace(`/cuenta/pedidos/${orderId}`);
    }, AUTO_REDIRECT_SECONDS * 1000);
    return () => clearTimeout(t);
  }, [orderId, router]);

  if (error) {
    return (
      <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-8">
        <p className="text-red-400 mb-4">{error}</p>
        {sessionId && (
          <button
            type="button"
            onClick={retry}
            disabled={retrying}
            className="block mb-4 text-[var(--gold)] hover:underline disabled:opacity-50"
          >
            {retrying ? "Verificando…" : "Reintentar verificación"}
          </button>
        )}
        <Link href="/cuenta/pedidos" className="text-[var(--gold)] hover:underline">
          Ver mis pedidos
        </Link>
      </div>
    );
  }

  if (!orderId) {
    return (
      <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-8">
        <p className="text-muted-foreground">Verificando pago…</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-8">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 text-green-400 mb-6">
        <CheckCircle className="w-10 h-10" />
      </div>
      <h1 className="font-display text-2xl font-bold text-[var(--foreground)] mb-2">
        Pago realizado
      </h1>
      <p className="text-muted-foreground mb-6">
        Tu pedido se ha confirmado. Redirigiendo al detalle del pedido…
      </p>
      <Link
        href={`/cuenta/pedidos/${orderId}`}
        className="inline-block px-6 py-3 rounded-lg bg-[var(--gold)] text-[var(--ink)] font-medium hover:bg-[var(--gold-soft)] transition-colors"
      >
        Ver detalle del pedido ahora
      </Link>
    </div>
  );
}
