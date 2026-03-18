"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings } from "lucide-react";

type ProviderData = {
  id: string;
  name: string;
  code: string | null;
  isActive: boolean;
  apiKey: string | null;
  apiSecret?: string | null;
  accessToken?: string | null;
  baseUrl?: string | null;
};

export function AdminEditProvider({ providerId, children }: { providerId: string; children?: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ProviderData | null>(null);
  const [form, setForm] = useState({
    name: "",
    code: "",
    apiKey: "",
    apiSecret: "",
    accessToken: "",
    baseUrl: "",
    isActive: true,
  });

  useEffect(() => {
    if (!open || !providerId) return;
    setLoading(true);
    setError(null);
    fetch(`/api/admin/providers/${providerId}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.error) {
          setError(res.error);
          setData(null);
          return;
        }
        setData(res);
        setForm({
          name: res.name ?? "",
          code: res.code ?? "",
          apiKey: res.apiKey ?? "",
          apiSecret: res.apiSecret ?? "",
          accessToken: res.accessToken ?? "",
          baseUrl: res.baseUrl ?? "",
          isActive: res.isActive !== false,
        });
      })
      .catch(() => setError("Error al cargar el proveedor"))
      .finally(() => setLoading(false));
  }, [open, providerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/providers/${providerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim() || undefined,
          code: form.code.trim() || null,
          apiKey: form.apiKey.trim() || null,
          apiSecret: form.apiSecret.trim() || null,
          accessToken: form.accessToken.trim() || null,
          baseUrl: form.baseUrl.trim() || null,
          isActive: form.isActive,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Error al guardar");
        return;
      }
      setOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children ? (
        <DialogTrigger asChild>{children}</DialogTrigger>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-[var(--border)] gap-1.5"
          onClick={() => setOpen(true)}
        >
          <Settings className="h-4 w-4" />
          Configurar API
        </Button>
      )}
      <DialogContent
        className="rounded-2xl border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => (children ? undefined : e)}
      >
        <DialogHeader>
          <DialogTitle>Configurar proveedor</DialogTitle>
        </DialogHeader>
        {loading ? (
          <p className="text-muted-foreground py-4">Cargando…</p>
        ) : error && !data ? (
          <p className="text-red-400 py-4">{error}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {error && (
              <p className="text-sm text-red-400 bg-red-400/10 p-3 rounded-lg">{error}</p>
            )}
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ej: CJDropshipping"
                  className="bg-[var(--elevated)] border-[var(--border)]"
                />
              </div>
              <div className="space-y-2">
                <Label>Código del adaptador</Label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                  placeholder="cj | aliexpress | shein"
                  className="bg-[var(--elevated)] border-[var(--border)]"
                />
                <p className="text-xs text-muted-foreground">
                  Usa <code className="bg-[var(--elevated)] px-1 rounded">cj</code>,{" "}
                  <code className="bg-[var(--elevated)] px-1 rounded">shein</code>,{" "}
                  <code className="bg-[var(--elevated)] px-1 rounded">aliexpress</code>,{" "}
                  <code className="bg-[var(--elevated)] px-1 rounded">printful</code> o{" "}
                  <code className="bg-[var(--elevated)] px-1 rounded">bigbuy</code>.
                </p>
              </div>
              <div className="space-y-2">
                <Label>API Key</Label>
                <Input
                  type="password"
                  autoComplete="off"
                  value={form.apiKey}
                  onChange={(e) => setForm((f) => ({ ...f, apiKey: e.target.value }))}
                  placeholder="Clave de API del proveedor"
                  className="bg-[var(--elevated)] border-[var(--border)]"
                />
                {form.code?.toLowerCase() === "cj" && (
                  <p className="text-xs text-muted-foreground">
                    Obtén tu API Key en{" "}
                    <a
                      href="https://www.cjdropshipping.com/myCJ.html#/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--gold)] hover:underline"
                    >
                      CJDropshipping → Mi CJ → API Key
                    </a>
                    . Pulsa <strong>Generate</strong> para crear una nueva. Solo necesitas la API Key (no hace falta API Secret para CJ).
                  </p>
                )}
                {form.code?.toLowerCase() === "bigbuy" && (
                  <p className="text-xs text-muted-foreground">
                    Obtén tu token API en tu{" "}
                    <a
                      href="https://www.bigbuy.eu/es/account/api.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--gold)] hover:underline"
                    >
                      panel de BigBuy → API / Cuenta
                    </a>
                    . Pégalo en <strong>API Key</strong> (o en Access Token si lo prefieres). Los productos deben tener el <strong>SKU de BigBuy</strong> en ID variante o ID de producto.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>API Secret (opcional)</Label>
                <Input
                  type="password"
                  autoComplete="off"
                  value={form.apiSecret}
                  onChange={(e) => setForm((f) => ({ ...f, apiSecret: e.target.value }))}
                  placeholder="Solo si el proveedor lo pide (ej. AliExpress)"
                  className="bg-[var(--elevated)] border-[var(--border)]"
                />
              </div>
              {(form.code?.toLowerCase() === "aliexpress" || form.code?.toLowerCase() === "printful") && (
                <div className="space-y-2">
                  <Label>
                    Access Token {form.code?.toLowerCase() === "printful" ? "(Printful) *" : "(AliExpress) *"}
                  </Label>
                  <Input
                    type="password"
                    autoComplete="off"
                    value={form.accessToken}
                    onChange={(e) => setForm((f) => ({ ...f, accessToken: e.target.value }))}
                    placeholder={
                      form.code?.toLowerCase() === "printful"
                        ? "Private Token de Printful (Developer Portal)"
                        : "Token OAuth de AliExpress Open Platform"
                    }
                    className="bg-[var(--elevated)] border-[var(--border)]"
                  />
                  <p className="text-xs text-muted-foreground">
                    {form.code?.toLowerCase() === "printful"
                      ? "Obligatorio para Printful. Obtén tu Private Token en developers.printful.com → Your tokens y pégalo aquí."
                      : "Obligatorio para crear pedidos. Obtén el token en openservice.aliexpress.com (autoriza tu app y copia el access_token)."}
                  </p>
                </div>
              )}
              <div className="space-y-2">
                <Label>URL base API (opcional)</Label>
                <Input
                  value={form.baseUrl}
                  onChange={(e) => setForm((f) => ({ ...f, baseUrl: e.target.value }))}
                  placeholder="https://developers.cjdropshipping.com/api2.0"
                  className="bg-[var(--elevated)] border-[var(--border)]"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="rounded border-[var(--border)]"
                />
                <Label htmlFor="isActive">Proveedor activo (enviar pedidos automáticamente)</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-[var(--border)]">
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-[var(--gold)] text-[var(--ink)] hover:bg-[var(--gold-soft)]"
                disabled={saving}
              >
                {saving ? "Guardando…" : "Guardar"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
