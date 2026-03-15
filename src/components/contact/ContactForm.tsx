"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/providers/LocaleProvider";

export function ContactForm() {
  const { t } = useLocale();
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
        setErrorMessage(json.error ?? t("contact.errorSend"));
        return;
      }
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
      setErrorMessage(t("contact.errorConnection"));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {status === "success" && (
        <p className="text-sm text-emerald-400 bg-emerald-400/10 p-3 rounded-lg">
          {t("contact.success")}
        </p>
      )}
      {status === "error" && errorMessage && (
        <p className="text-sm text-red-400 bg-red-400/10 p-3 rounded-lg">{errorMessage}</p>
      )}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nombre" className="text-[var(--foreground)]">{t("contact.name")}</Label>
          <Input
            id="nombre"
            name="nombre"
            required
            placeholder={t("contact.namePlaceholder")}
            className="bg-[var(--elevated)] border-[var(--border)]"
            disabled={status === "sending"}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-[var(--foreground)]">{t("contact.email")}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder={t("contact.emailPlaceholder")}
            className="bg-[var(--elevated)] border-[var(--border)]"
            disabled={status === "sending"}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="asunto" className="text-[var(--foreground)]">{t("contact.subject")}</Label>
        <Input
          id="asunto"
          name="asunto"
          required
          placeholder={t("contact.subjectPlaceholder")}
          className="bg-[var(--elevated)] border-[var(--border)]"
          disabled={status === "sending"}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="mensaje" className="text-[var(--foreground)]">{t("contact.message")}</Label>
        <textarea
          id="mensaje"
          name="mensaje"
          required
          rows={5}
          placeholder={t("contact.messagePlaceholder")}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--elevated)] px-3 py-2 text-[var(--foreground)] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--gold)] disabled:opacity-60"
          disabled={status === "sending"}
        />
      </div>
      <Button
        type="submit"
        disabled={status === "sending"}
        className="rounded-xl bg-[var(--gold)] text-[var(--ink)] hover:bg-[var(--gold-soft)] font-medium w-full sm:w-auto"
      >
        {status === "sending" ? t("contact.sending") : t("contact.send")}
      </Button>
    </form>
  );
}
