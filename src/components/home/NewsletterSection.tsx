"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    setMessage("");
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok) {
      setStatus("success");
      setEmail("");
      setMessage("Gracias. Te hemos añadido a la lista.");
    } else {
      setStatus("error");
      setMessage(json.error ?? "Error al suscribirse.");
    }
  };

  return (
    <section className="py-24 lg:py-32 border-t border-[var(--border)]">
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div
          className="max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-[var(--gold)] text-sm uppercase tracking-[0.2em] mb-3">
            Newsletter
          </p>
          <h2 className="font-display text-display-sm text-[var(--foreground)] tracking-tighter mb-4">
            Únete a la comunidad
          </h2>
          <p className="text-muted-foreground mb-10">
            10% de descuento en tu primera compra al suscribirte.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <Input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === "loading"}
              className="flex-1 rounded-none border-[var(--border)] bg-transparent py-4 focus-visible:ring-[var(--gold)]"
            />
            <Button
              type="submit"
              disabled={status === "loading"}
              className="rounded-none bg-[var(--gold)] text-[var(--ink)] hover:bg-[var(--gold-soft)] font-medium uppercase tracking-wider shrink-0"
            >
              {status === "loading" ? "Enviando…" : "Suscribirme"}
            </Button>
          </form>
          {message && (
            <p className={`mt-4 text-sm ${status === "success" ? "text-emerald-400" : "text-red-400"}`}>
              {message}
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
