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

export function AdminImportSheinButton() {
  const [open, setOpen] = useState(false);
  const [sheinIdOrUrl, setSheinIdOrUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleImport = async () => {
    if (!sheinIdOrUrl.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/admin/products/import/shein", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sheinProductId: sheinIdOrUrl.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error importando producto de Shein");
      }

      toast({
        title: "Producto importado",
        description: data.message || "Producto Shein añadido a la tienda.",
      });

      setOpen(false);
      setSheinIdOrUrl("");
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
          Importar Shein
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#0A0A0A] border-[var(--border)] text-white">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-tight text-[var(--gold)]">
            Importar de Shein
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Pega el <strong>ID del producto</strong> (ej: 33704388) o la <strong>URL completa</strong> del producto en Shein. El sistema importará título, imágenes, variantes (talla/color) y precios con margen.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="sheinId" className="text-sm font-medium">
              ID o URL del producto Shein
            </label>
            <Input
              id="sheinId"
              value={sheinIdOrUrl}
              onChange={(e) => setSheinIdOrUrl(e.target.value)}
              placeholder="Ej: 33704388 o https://...-p-33704388.html"
              className="bg-[#111] border-gray-800 focus:border-[var(--gold)] focus:ring-[var(--gold)]"
            />
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
            disabled={!sheinIdOrUrl.trim() || loading}
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
