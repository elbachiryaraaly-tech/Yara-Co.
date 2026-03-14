"use client";

import { useState, useRef, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().email("Introduce un email válido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

type FormData = z.infer<typeof schema>;

type LoginFormProps = {
  defaultCallbackUrl?: string;
};

export function LoginForm({ defaultCallbackUrl }: LoginFormProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorFromUrl = searchParams?.get("error");
  const errorMessage =
    errorFromUrl === "login_required"
      ? "Inicia sesión para acceder al panel de administración."
      : errorFromUrl === "CredentialsSignin"
      ? "Email o contraseña incorrectos."
      : errorFromUrl
      ? decodeURIComponent(errorFromUrl)
      : null;
  const [error, setError] = useState<string | null>(errorMessage);
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [lastAttemptEmail, setLastAttemptEmail] = useState<string | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultCallbackUrl === "/admin" ? { email: "admin@yaraandco.com" } : undefined,
  });
  const emailValue = watch("email");

  useEffect(() => {
    if (error && errorRef.current) errorRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [error]);

  const onSubmit = async (data: FormData) => {
    setError(null);
    setResendStatus("idle");
    setLastAttemptEmail(data.email);
    try {
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (res?.error) {
        const isCredentials = res.error === "CredentialsSignin";
        setError(
          defaultCallbackUrl === "/admin"
            ? (isCredentials
              ? "Email o contraseña incorrectos. Comprueba usuario/contraseña o ejecuta npm run db:seed."
              : res.error)
            : (isCredentials
              ? "Email o contraseña incorrectos. Si acabas de registrarte, verifica tu correo con el enlace que te enviamos."
              : res.error)
        );
        return;
      }
      if (!res || res.ok !== true) {
        setError(
          "El servidor de autenticación no respondió. En la terminal: para el servidor (Ctrl+C), ejecuta npm run dev:clean y vuelve a intentar."
        );
        return;
      }
      const callback =
        searchParams?.get("callbackUrl") ?? defaultCallbackUrl ?? "/cuenta";
      if (defaultCallbackUrl === "/admin" && typeof window !== "undefined") {
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json().catch(() => ({}));
        if (!session?.user) {
          setError(
            "La sesión no se creó. El servidor puede estar fallando. Borra la carpeta .next, ejecuta npm run dev y prueba de nuevo."
          );
          return;
        }
      }
      if (typeof window !== "undefined") {
        window.location.href = callback;
      } else {
        router.push(callback);
        router.refresh();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error inesperado";
      setError(
        `Error al conectar: ${msg}. Prueba en la terminal: npm run dev:clean y vuelve a intentar.`
      );
    }
  };

  const handleResendVerification = async () => {
    const email = lastAttemptEmail || emailValue;
    if (!email) return;
    setResendStatus("sending");
    const res = await fetch("/api/auth/reenviar-verificacion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok) {
      setResendStatus("sent");
      setError(null);
    } else {
      setResendStatus("error");
      setError(json.error ?? "No se pudo reenviar el correo.");
    }
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 p-8 rounded-2xl bg-[var(--card)] border border-[var(--border)]"
    >
      {error && (
        <div className="space-y-2">
          <p className="text-sm text-red-400 bg-red-400/10 p-3 rounded-lg">{error}</p>
          {defaultCallbackUrl !== "/admin" && (lastAttemptEmail || emailValue) && (
            <p className="text-sm text-muted-foreground">
              ¿Acabas de registrarte?{" "}
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendStatus === "sending"}
                className="text-[var(--gold)] hover:underline disabled:opacity-50"
              >
                {resendStatus === "sending"
                  ? "Enviando…"
                  : resendStatus === "sent"
                    ? "Correo reenviado"
                    : "Reenviar correo de verificación"}
              </button>
            </p>
          )}
        </div>
      )}
      {resendStatus === "sent" && !error && (
        <p className="text-sm text-green-400 bg-green-400/10 p-3 rounded-lg">
          Hemos enviado un nuevo correo de verificación. Revisa tu bandeja.
        </p>
      )}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-foreground">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder={defaultCallbackUrl === "/admin" ? "admin@yaraandco.com" : "tu@email.com"}
          className="mt-2 bg-[var(--elevated)] border-[var(--border)] text-foreground placeholder:text-muted-foreground focus-visible:ring-[var(--gold)]"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-red-400">{errors.email.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="password" className="text-foreground">
            Contraseña
          </Label>
          <Link
            href="/recuperar"
            className="text-xs text-muted-foreground hover:text-[var(--gold)] transition-colors"
          >
            ¿Olvidaste la contraseña?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          className="mt-2 bg-[var(--elevated)] border-[var(--border)] text-foreground placeholder:text-muted-foreground focus-visible:ring-[var(--gold)]"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-red-400">{errors.password.message}</p>
        )}
      </div>
      <Button
        type="submit"
        className="w-full rounded-lg bg-[var(--gold)] text-[var(--ink)] hover:bg-[var(--gold-soft)] font-medium"
        size="lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Entrando…" : "Entrar"}
      </Button>
      {defaultCallbackUrl !== "/admin" && (
        <p className="text-center text-muted-foreground text-sm pt-2">
          ¿No tienes cuenta?{" "}
          <Link
            href="/register"
            className="text-[var(--gold)] hover:text-[var(--gold-soft)] transition-colors font-medium"
          >
            Regístrate
          </Link>
        </p>
      )}
    </form>
  );
}
