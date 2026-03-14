"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = {
      nombre: formData.get("nombre") as string,
      email: formData.get("email") as string,
      asunto: formData.get("asunto") as string,
      mensaje: formData.get("mensaje") as string,
    };

    setStatus("sending");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(json.error ?? "Error al enviar. Inténtalo de nuevo.");
        return;
      }
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
      setErrorMessage("Error de conexión. Inténtalo de nuevo.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {status === "success" && (
        <p className="text-sm text-emerald-400 bg-emerald-400/10 p-3 rounded-lg">
          Mensaje enviado correctamente. Te contestaremos en 24–48 horas laborables.
        </p>
      )}
      {status === "error" && errorMessage && (
        <p className="text-sm text-red-400 bg-red-400/10 p-3 rounded-lg">{errorMessage}</p>
      )}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nombre" className="text-[var(--foreground)]">Nombre *</Label>
          <Input
            id="nombre"
            name="nombre"
            required
            placeholder="Tu nombre"
            className="bg-[var(--elevated)] border-[var(--border)]"
            disabled={status === "sending"}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-[var(--foreground)]">Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="tu@email.com"
            className="bg-[var(--elevated)] border-[var(--border)]"
            disabled={status === "sending"}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="asunto" className="text-[var(--foreground)]">Asunto *</Label>
        <Input
          id="asunto"
          name="asunto"
          required
          placeholder="Ej: Consulta sobre pedido"
          className="bg-[var(--elevated)] border-[var(--border)]"
          disabled={status === "sending"}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="mensaje" className="text-[var(--foreground)]">Mensaje *</Label>
        <textarea
          id="mensaje"
          name="mensaje"
          required
          rows={5}
          placeholder="Escribe tu mensaje..."
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--elevated)] px-3 py-2 text-[var(--foreground)] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--gold)] disabled:opacity-60"
          disabled={status === "sending"}
        />
      </div>
      <Button
        type="submit"
        disabled={status === "sending"}
        className="rounded-xl bg-[var(--gold)] text-[var(--ink)] hover:bg-[var(--gold-soft)] font-medium w-full sm:w-auto"
      >
        {status === "sending" ? "Enviando…" : "Enviar mensaje"}
      </Button>
    </form>
  );
}
