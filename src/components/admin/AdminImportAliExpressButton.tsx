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

function extractAliExpressProductId(input: string): string {
  const raw = (input || "").trim();
  if (!raw) return "";
  if (/^\d+$/.test(raw)) return raw;

  // Ejemplos típicos:
  // - https://www.aliexpress.com/item/100500xxxxxx.html
  // - https://www.aliexpress.com/item/100500xxxxxx.html?spm=...
  const fromUrl =
    raw.match(/\/item\/(\d+)\.html/i) ||
    raw.match(/\/item\/(\d+)(?:\?|#)/i) ||
    raw.match(/[?&](itemId|productId|product_id|num_iid)=(\d+)/i);
  return fromUrl?.[1] || "";
}

export function AdminImportAliExpressButton() {
  const [open, setOpen] = useState(false);
  const [idOrUrl, setIdOrUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleImport = async () => {
    const extracted = extractAliExpressProductId(idOrUrl);
    if (!extracted) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/products/import/aliexpress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aliexpressProductId: extracted }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Error importando producto de AliExpress");
      }

      toast({
        title: "Producto importado",
        description: data.message || "Producto AliExpress añadido a la tienda.",
      });

      setOpen(false);
      setIdOrUrl("");
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
          Importar AliExpress
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px] bg-[#0A0A0A] border-[var(--border)] text-white">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-tight text-[var(--gold)]">
            Importar de AliExpress
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Pega el <strong>ID del producto</strong> (por ejemplo, el número que ves en la URL) o una <strong>URL</strong> del
            producto. El sistema intentará crear el producto y una variante mínima para poder enviar pedidos.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="aliexpressId" className="text-sm font-medium">
              ID o URL del producto AliExpress
            </label>
            <Input
              id="aliexpressId"
              value={idOrUrl}
              onChange={(e) => setIdOrUrl(e.target.value)}
              placeholder="Ej: 100500xxxxxx o https://www.aliexpress.com/item/100500xxxxxx.html"
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
            disabled={loading || !extractAliExpressProductId(idOrUrl)}
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

