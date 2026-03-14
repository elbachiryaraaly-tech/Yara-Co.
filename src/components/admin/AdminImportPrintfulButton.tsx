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

export function AdminImportPrintfulButton() {
  const [open, setOpen] = useState(false);
  const [printfulId, setPrintfulId] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleImport = async () => {
    const id = printfulId.trim();
    if (!id) return;
    const num = parseInt(id, 10);
    if (!Number.isInteger(num) || num <= 0) {
      toast({
        title: "ID inválido",
        description: "El ID del producto de Printful debe ser un número (ej. 71).",
        variant: "error",
      });
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/admin/products/import/printful", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ printfulProductId: num }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error importando producto de Printful");
      }

      toast({
        title: "Producto importado",
        description: data.message || "Producto añadido a la tienda correctamente.",
      });

      setOpen(false);
      setPrintfulId("");
      router.refresh();
    } catch (err) {
      toast({
        title: "Error de importación",
        description: err instanceof Error ? err.message : "Desconocido",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 rounded-xl text-[var(--gold)] border-[var(--gold)] border-opacity-30 hover:bg-[var(--gold)] hover:bg-opacity-10 shrink-0"
        >
          <CopyPlus className="h-4 w-4" />
          Importar Printful
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#0A0A0A] border-[var(--border)] text-white">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-tight text-[var(--gold)]">
            Importar de Printful
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Pega el <strong>ID del producto</strong> del catálogo de Printful (número). El sistema descargará título,
            descripción, imágenes, precios (margen x2) y todas las variantes con su <strong>variant_id</strong>. El
            producto quedará asignado a Printful y listo para enviar pedidos.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="printfulId" className="text-sm font-medium">
              ID del producto en Printful
            </label>
            <Input
              id="printfulId"
              type="text"
              inputMode="numeric"
              value={printfulId}
              onChange={(e) => setPrintfulId(e.target.value.replace(/\D/g, ""))}
              placeholder="Ej: 71"
              className="bg-[#111] border-gray-800 focus:border-[var(--gold)] focus:ring-[var(--gold)]"
            />
            <p className="text-xs text-muted-foreground">
              Puedes ver el ID en la URL al abrir un producto en el catálogo de Printful, o en la API (GET
              /products).
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
            onClick={handleImport}
            disabled={!printfulId.trim() || loading}
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
