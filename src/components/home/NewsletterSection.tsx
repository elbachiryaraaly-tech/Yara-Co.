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
    <section className="py-24 lg:py-32 border-t border-[var(--gold)]/10 bg-[var(--ink)]">
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div
          className="max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="h-px w-12 bg-[var(--gold)]/80" />
            <p className="text-[var(--gold)] text-sm uppercase tracking-[0.25em] font-medium">
              Newsletter
            </p>
          </div>
          <h2 className="font-display text-display-sm text-[var(--foreground)] tracking-tighter mb-4">
            Únete a la comunidad
          </h2>
          <p className="text-[var(--foreground)]/60 mb-10 text-[15px] leading-relaxed">
            10% de descuento en tu primera compra al suscribirte.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <Input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === "loading"}
              className="flex-1 rounded-none border-[var(--gold)]/20 bg-[var(--elevated)]/80 py-4 text-foreground placeholder:text-foreground/40 focus-visible:ring-[var(--gold)] focus-visible:border-[var(--gold)]/40 transition-colors"
            />
            <Button
              type="submit"
              disabled={status === "loading"}
              className="rounded-none bg-[var(--gold)] text-[var(--ink)] hover:bg-[var(--gold-soft)] font-medium uppercase tracking-[0.18em] shrink-0 transition-colors duration-300"
            >
              {status === "loading" ? "Enviando…" : "Suscribirme"}
            </Button>
          </form>
          {message && (
            <p className={`mt-4 text-sm ${status === "success" ? "text-[var(--gold-soft)]" : "text-red-400/90"}`}>
              {message}
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
