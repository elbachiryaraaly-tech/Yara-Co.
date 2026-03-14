"use client";

import { useEffect, useState } from "react";

export function VerifyEmailClient({ token: initialToken }: { token: string | null }) {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!initialToken) {
      setStatus("error");
      setMessage("Falta el enlace de verificación. Revisa el correo que te enviamos.");
      return;
    }
    fetch(`/api/auth/verify-email?token=${encodeURIComponent(initialToken)}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          setStatus("ok");
          setMessage(data.message ?? "Correo verificado. Ya puedes iniciar sesión.");
        } else {
          setStatus("error");
          setMessage(data.error ?? "Enlace inválido o caducado.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Error de conexión. Inténtalo de nuevo.");
      });
  }, [initialToken]);

  if (status === "loading") {
    return (
      <p className="text-muted-foreground">Comprobando enlace…</p>
    );
  }
  if (status === "ok") {
    return (
      <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
        <p className="text-[var(--foreground)] mb-4">{message}</p>
        <a
          href="/login"
          className="inline-block px-6 py-3 rounded-lg bg-[var(--gold)] text-[var(--ink)] font-medium hover:bg-[var(--gold-soft)] transition-colors"
        >
          Iniciar sesión
        </a>
      </div>
    );
  }
  return (
    <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30">
      <p className="text-red-400">{message}</p>
      <p className="text-sm text-muted-foreground mt-2">
        Puedes solicitar un nuevo correo de verificación desde la página de{" "}
        <a href="/login" className="text-[var(--gold)] hover:underline">inicio de sesión</a>.
      </p>
    </div>
  );
}
