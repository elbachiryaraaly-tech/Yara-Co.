"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function TokenHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"reading" | "saving" | "ok" | "error">("reading");
  const [message, setMessage] = useState("");
  const sentRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || sentRef.current) return;
    const hash = window.location.hash?.slice(1) || "";
    const fromHash = new URLSearchParams(hash);
    const fromQuery = searchParams;
    const access_token = fromHash.get("access_token") ?? fromQuery.get("access_token");
    const refresh_token =
      fromHash.get("refresh_token") ?? fromQuery.get("refresh_token") ?? undefined;
    const state = fromQuery.get("state") ?? fromHash.get("state");

    if (!access_token) {
      setStatus("error");
      setMessage("No se encontró access_token en la URL. Usa «Conectar con AliExpress» desde Proveedores (flujo con code).");
      return;
    }

    sentRef.current = true;
    setStatus("saving");
    fetch("/api/auth/aliexpress/save-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ access_token, refresh_token, state }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setStatus("ok");
          router.replace("/admin/proveedores?aliexpress=connected");
        } else {
          setStatus("error");
          setMessage(data.error || "Error al guardar el token");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Error de conexión al guardar el token");
      });
  }, [router, searchParams]);

  return (
    <div className="min-h-[40vh] flex items-center justify-center p-6">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 max-w-md w-full text-center">
        {status === "reading" && <p className="text-muted-foreground">Leyendo token…</p>}
        {status === "saving" && <p className="text-muted-foreground">Guardando token…</p>}
        {status === "ok" && <p className="text-emerald-400">Token guardado. Redirigiendo…</p>}
        {status === "error" && (
          <>
            <p className="text-red-400 mb-4">{message}</p>
            <button
              type="button"
              onClick={() => router.push("/admin/proveedores")}
              className="text-sm text-[var(--gold)] hover:underline"
            >
              Volver a Proveedores
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function AliexpressTokenPage() {
  return (
    <Suspense fallback={<div className="min-h-[40vh] flex items-center justify-center p-6"><p className="text-muted-foreground">Cargando…</p></div>}>
      <TokenHandler />
    </Suspense>
  );
}
