"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  token: string | null;
};

type Mode = "request" | "reset";

export function ForgotPasswordClient({ token }: Props) {
  const router = useRouter();
  const initialMode: Mode = token ? "reset" : "request";
  const [mode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!email.trim()) {
      setError("Introduce tu email.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "No se pudo enviar el enlace. Inténtalo de nuevo.");
      } else {
        setMessage(
          json.message ??
            "Si el correo existe en nuestra base de datos, te hemos enviado un enlace para restablecer tu contraseña."
        );
      }
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setMessage(null);
    if (!password || password.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "No se pudo cambiar la contraseña.");
      } else {
        setMessage(json.message ?? "Contraseña actualizada correctamente. Ahora puedes iniciar sesión.");
        setTimeout(() => {
          router.push("/login");
        }, 2500);
      }
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (mode === "reset" && !token) {
    return (
      <p className="text-muted-foreground">
        Enlace no válido. Solicita un nuevo correo de recuperación desde la página anterior.
      </p>
    );
  }

  const title =
    mode === "request" ? "Recuperar contraseña" : "Elige una nueva contraseña";

  return (
    <form
      onSubmit={mode === "request" ? handleRequest : handleReset}
      className="space-y-6 p-8 rounded-2xl bg-[var(--card)] border border-[var(--border)]"
    >
      <h1 className="font-display text-2xl font-bold text-[var(--foreground)] text-center mb-2">
        {title}
      </h1>
      {mode === "request" && (
        <p className="text-sm text-muted-foreground text-center">
          Introduce tu email y te enviaremos un enlace seguro para restablecer tu contraseña.
        </p>
      )}
      {mode === "reset" && (
        <p className="text-sm text-muted-foreground text-center">
          Escribe tu nueva contraseña. Tras guardarla podrás iniciar sesión de nuevo.
        </p>
      )}
      {error && (
        <p className="text-sm text-red-400 bg-red-400/10 p-3 rounded-lg">
          {error}
        </p>
      )}
      {message && !error && (
        <p className="text-sm text-green-400 bg-green-400/10 p-3 rounded-lg">
          {message}
        </p>
      )}
      {mode === "request" && (
        <div className="space-y-2">
          <Label htmlFor="email" className="text-[var(--foreground)]">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="tu@email.com"
            className="mt-2 bg-[var(--elevated)] border-[var(--border)] text-[var(--foreground)] placeholder:text-muted-foreground focus-visible:ring-[var(--gold)]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      )}
      {mode === "reset" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-[var(--foreground)]">
              Nueva contraseña
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              className="mt-2 bg-[var(--elevated)] border-[var(--border)] text-[var(--foreground)] placeholder:text-muted-foreground focus-visible:ring-[var(--gold)]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm" className="text-[var(--foreground)]">
              Repite la nueva contraseña
            </Label>
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              className="mt-2 bg-[var(--elevated)] border-[var(--border)] text-[var(--foreground)] placeholder:text-muted-foreground focus-visible:ring-[var(--gold)]"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </>
      )}
      <Button
        type="submit"
        className="w-full rounded-lg bg-[var(--gold)] text-[var(--ink)] hover:bg-[var(--gold-soft)] font-medium"
        size="lg"
        disabled={loading}
      >
        {loading
          ? "Procesando…"
          : mode === "request"
          ? "Enviar enlace"
          : "Guardar contraseña"}
      </Button>
    </form>
  );
}

