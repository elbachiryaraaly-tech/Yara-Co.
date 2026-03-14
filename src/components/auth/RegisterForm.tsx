"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z
  .object({
    name: z.string().min(2, "Mínimo 2 caracteres"),
    email: z.string().email("Introduce un email válido"),
    password: z.string().min(6, "Mínimo 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        password: data.password,
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(json.error ?? "Error al crear la cuenta");
      return;
    }
    setRegisteredEmail(data.email);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="space-y-6 p-8 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--gold)]/20 text-[var(--gold)] mb-2">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="font-display text-xl font-bold text-[var(--foreground)]">
          Revisa tu correo
        </h3>
        <p className="text-muted-foreground">
          Hemos enviado un enlace de verificación a <strong className="text-[var(--foreground)]">{registeredEmail}</strong>. Haz clic en el enlace para activar tu cuenta.
        </p>
        <p className="text-sm text-muted-foreground">
          ¿No lo ves? Revisa la carpeta de spam.
        </p>
        <Link
          href="/login"
          className="inline-block mt-4 px-6 py-3 rounded-lg bg-[var(--gold)] text-[var(--ink)] font-medium hover:bg-[var(--gold-soft)] transition-colors"
        >
          Ir a iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 p-8 rounded-2xl bg-[var(--card)] border border-[var(--border)]"
    >
      <div className="space-y-2">
        <Label htmlFor="name" className="text-[var(--foreground)]">
          Nombre completo
        </Label>
        <Input
          id="name"
          type="text"
          placeholder="Tu nombre"
          className="mt-2 bg-[var(--elevated)] border-[var(--border)] text-[var(--foreground)] placeholder:text-muted-foreground focus-visible:ring-[var(--gold)]"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-red-400">{errors.name.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-[var(--foreground)]">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="tu@email.com"
          className="mt-2 bg-[var(--elevated)] border-[var(--border)] text-[var(--foreground)] placeholder:text-muted-foreground focus-visible:ring-[var(--gold)]"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-red-400">{errors.email.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-[var(--foreground)]">
          Contraseña
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="Mínimo 6 caracteres"
          className="mt-2 bg-[var(--elevated)] border-[var(--border)] text-[var(--foreground)] placeholder:text-muted-foreground focus-visible:ring-[var(--gold)]"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-red-400">{errors.password.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-[var(--foreground)]">
          Confirmar contraseña
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Repite la contraseña"
          className="mt-2 bg-[var(--elevated)] border-[var(--border)] text-[var(--foreground)] placeholder:text-muted-foreground focus-visible:ring-[var(--gold)]"
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-red-400">{errors.confirmPassword.message}</p>
        )}
      </div>
      <Button
        type="submit"
        className="w-full rounded-lg bg-[var(--gold)] text-[var(--ink)] hover:bg-[var(--gold-soft)] font-medium"
        size="lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creando cuenta…" : "Crear cuenta"}
      </Button>
      <p className="text-center text-muted-foreground text-sm pt-2">
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/login"
          className="text-[var(--gold)] hover:text-[var(--gold-soft)] transition-colors font-medium"
        >
          Iniciar sesión
        </Link>
      </p>
    </form>
  );
}
