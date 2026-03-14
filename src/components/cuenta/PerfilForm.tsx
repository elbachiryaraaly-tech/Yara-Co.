"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const schema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres"),
  email: z.string().email("Email no válido"),
  phone: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Requerido"),
  newPassword: z.string().min(6, "Mínimo 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type ProfileData = z.infer<typeof schema>;
type PasswordData = z.infer<typeof passwordSchema>;

export function PerfilForm({
  initialData = { name: "", email: "" },
}: {
  initialData?: { name?: string; email?: string };
}) {
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileData>({
    resolver: zodResolver(schema),
    defaultValues: { name: initialData.name ?? "", email: initialData.email ?? "", phone: "" },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordData>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: ProfileData) => {
    setProfileError(null);
    setProfileSuccess(false);
    const res = await fetch("/api/cuenta/perfil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: data.name, email: data.email }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setProfileError(json.error ?? "Error al guardar");
      return;
    }
    setProfileSuccess(true);
  };

  const onPasswordSubmit = async (data: PasswordData) => {
    setPasswordError(null);
    setPasswordSuccess(false);
    const res = await fetch("/api/cuenta/cambiar-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setPasswordError(json.error ?? "Error al actualizar contraseña");
      return;
    }
    setPasswordSuccess(true);
    resetPassword();
  };

  return (
    <div className="space-y-10">
      <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
        <CardHeader>
          <CardTitle className="text-[var(--foreground)]">Información personal</CardTitle>
          <CardDescription className="text-muted-foreground">
            Nombre y datos de contacto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-6 max-w-xl">
            {profileError && (
              <p className="text-sm text-red-400 bg-red-400/10 p-3 rounded-lg">{profileError}</p>
            )}
            {profileSuccess && (
              <p className="text-sm text-emerald-400 bg-emerald-400/10 p-3 rounded-lg">Datos guardados correctamente.</p>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  className="rounded-lg border-[var(--border)] bg-transparent"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  className="rounded-lg border-[var(--border)] bg-transparent"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono (opcional)</Label>
              <Input
                id="phone"
                type="tel"
                className="max-w-xs rounded-lg border-[var(--border)] bg-transparent"
                {...register("phone")}
              />
            </div>
            <Button type="submit" className="rounded-lg">
              Guardar cambios
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
        <CardHeader>
          <CardTitle className="text-[var(--foreground)]">Cambiar contraseña</CardTitle>
          <CardDescription className="text-muted-foreground">
            Usa una contraseña segura de al menos 6 caracteres
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6 max-w-xl">
            {passwordError && (
              <p className="text-sm text-red-400 bg-red-400/10 p-3 rounded-lg">{passwordError}</p>
            )}
            {passwordSuccess && (
              <p className="text-sm text-emerald-400 bg-emerald-400/10 p-3 rounded-lg">Contraseña actualizada.</p>
            )}
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Contraseña actual</Label>
              <Input
                id="currentPassword"
                type="password"
                className="rounded-lg border-[var(--border)] bg-transparent"
                {...registerPassword("currentPassword")}
              />
              {passwordErrors.currentPassword && (
                <p className="text-sm text-red-500">{passwordErrors.currentPassword.message}</p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nueva contraseña</Label>
                <Input
                  id="newPassword"
                  type="password"
                  className="rounded-lg border-[var(--border)] bg-transparent"
                  {...registerPassword("newPassword")}
                />
                {passwordErrors.newPassword && (
                  <p className="text-sm text-red-500">{passwordErrors.newPassword.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  className="rounded-lg border-[var(--border)] bg-transparent"
                  {...registerPassword("confirmPassword")}
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-sm text-red-500">{passwordErrors.confirmPassword.message}</p>
                )}
              </div>
            </div>
            <Button type="submit" variant="secondary" className="rounded-lg">
              Actualizar contraseña
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
