"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CopyPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/providers/ToastProvider";

const FETCH_TIMEOUT_MS = 35000;

export function AdminImportBigBuyButton() {
  const [open, setOpen] = useState(false);
  const [bigbuyId, setBigbuyId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleImport = async () => {
    const id = bigbuyId.trim();
    if (!id) return;
    const num = parseInt(id, 10);
    if (!Number.isInteger(num) || num <= 0) {
      setError("El ID debe ser un número válido.");
      toast({
        title: "ID inválido",
        description: "El ID del producto de BigBuy debe ser un número.",
        variant: "error",
      });
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

      const res = await fetch("/api/admin/products/import/bigbuy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bigbuyProductId: num }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let data: { error?: string; message?: string };
      try {
        data = await res.json();
      } catch {
        data = { error: res.statusText || "Respuesta inválida del servidor" };
      }

      if (!res.ok) {
        const msg = data.error || "Error importando producto de BigBuy";
        setError(msg);
        throw new Error(msg);
      }

      toast({
        title: "Producto importado",
        description: data.message || "Producto añadido a la tienda correctamente.",
      });

      setOpen(false);
      setBigbuyId("");
      setError(null);
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.name === "AbortError"
            ? "Tiempo de espera agotado. La API de BigBuy puede estar lenta. Intenta de nuevo."
            : err.message
          : "Error desconocido";
      setError(message);
      toast({
        title: "Error de importación",
        description: message,
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) setError(null);
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 rounded-xl text-[var(--gold)] border-[var(--gold)] border-opacity-30 hover:bg-[var(--gold)] hover:bg-opacity-10 shrink-0"
        >
          <CopyPlus className="h-4 w-4" />
          Importar BigBuy
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#0A0A0A] border-[var(--border)] text-white">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-tight text-[var(--gold)]">
            Importar de BigBuy
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Pega el <strong>ID del producto</strong> del catálogo de BigBuy (número). El sistema descargará nombre,
            descripción, imágenes, precio mayorista (margen x2) y creará una variante con el <strong>SKU</strong> de
            BigBuy para poder enviar pedidos.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="bigbuyId" className="text-sm font-medium">
              ID del producto en BigBuy
            </label>
            <Input
              id="bigbuyId"
              type="text"
              inputMode="numeric"
              value={bigbuyId}
              onChange={(e) => setBigbuyId(e.target.value.replace(/\D/g, ""))}
              placeholder="Ej: 12345"
              className="bg-[#111] border-gray-800 focus:border-[var(--gold)] focus:ring-[var(--gold)]"
            />
            <p className="text-xs text-muted-foreground">
              Puedes obtener el ID desde la API de BigBuy (GET /rest/catalog/products) o desde tu panel de BigBuy.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
            className="border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleImport}
            disabled={!bigbuyId.trim() || loading}
            className="bg-[var(--gold)] text-[var(--ink)] hover:bg-[var(--gold-soft)]"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importando...
              </>
            ) : (
              "Importar producto"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
