"use client";

import { useState } from "react";
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
import { Plus } from "lucide-react";

export function AdminAddProvider() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Escribe el nombre del proveedor.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed, isActive: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Error al crear el proveedor");
        return;
      }
      setName("");
      setOpen(false);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl bg-[var(--gold)] text-[var(--ink)] hover:bg-[var(--gold-soft)] gap-2">
          <Plus className="h-4 w-4" />
          Añadir proveedor
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]">
        <DialogHeader>
          <DialogTitle>Nuevo proveedor</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 p-3 rounded-lg">{error}</p>
          )}
          <div className="space-y-2">
            <Label>Nombre del proveedor</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: AliExpress, CJDropshipping"
              className="bg-[var(--elevated)] border-[var(--border)]"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-[var(--border)]">
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-[var(--gold)] text-[var(--ink)] hover:bg-[var(--gold-soft)]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creando…" : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
