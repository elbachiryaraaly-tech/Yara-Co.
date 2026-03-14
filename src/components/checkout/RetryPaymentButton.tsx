"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";

export function RetryPaymentButton({ orderId }: { orderId: string }) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleRetry = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/checkout/retry", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId }),
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Ocurrió un error al intentar generar el pago");
            }

            if (data.url) {
                window.location.href = data.url;
            }
        } catch (e) {
            toast({
                title: "Error",
                description: e instanceof Error ? e.message : "Error desconocido",
                variant: "error",
            });
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleRetry}
            disabled={isLoading}
            className="w-full rounded-lg bg-[var(--gold)] text-[var(--ink)] hover:bg-[var(--gold-soft)] font-medium mt-4"
        >
            <CreditCard className="mr-2 h-4 w-4" />
            {isLoading ? "Procesando…" : "Completar Pago"}
        </Button>
    );
}
