"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export function RetryDropshippingButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleRetry = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/retry-dropshipping`, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setMessage({ type: "success", text: "Pedido enviado al proveedor correctamente." });
        router.refresh();
      } else {
        setMessage({ type: "error", text: data.error ?? "Error al reintentar" });
      }
    } catch {
      setMessage({ type: "error", text: "Error de conexión" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="rounded-xl border-[var(--border)] gap-2"
        onClick={handleRetry}
        disabled={loading}
      >
        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        {loading ? "Enviando…" : "Reenviar al proveedor"}
      </Button>
      {message && (
        <p
          className={`text-sm ${
            message.type === "success" ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
