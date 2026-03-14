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

export function AdminImportCjButton() {
    const [open, setOpen] = useState(false);
    const [cjId, setCjId] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleImport = async () => {
        if (!cjId.trim()) return;
        setLoading(true);

        try {
            const res = await fetch("/api/admin/products/import/cj", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cjProductId: cjId.trim() }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Error importando producto de CJ");
            }

            toast({
                title: "Producto importado",
                description: data.message || "Producto añadido a la tienda correctamente.",
            });

            setOpen(false);
            setCjId("");
            router.refresh();
            // Opcional: router.push(`/admin/productos/${data.id}`);
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
                <Button variant="outline" className="gap-2 rounded-xl text-[var(--gold)] border-[var(--gold)] border-opacity-30 hover:bg-[var(--gold)] hover:bg-opacity-10 shrink-0">
                    <CopyPlus className="h-4 w-4" />
                    Importar CJ
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-[#0A0A0A] border-[var(--border)] text-white">
                <DialogHeader>
                    <DialogTitle className="font-display text-2xl tracking-tight text-[var(--gold)]">Importar de CJ Dropshipping</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Pega el ID del producto de CJDropshipping. El sistema descargará título, descripción, fotos, precio (margen 50%) y todas las variantes. El producto se publicará directamente como **Activo** en la tienda.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="cjId" className="text-sm font-medium">
                            ID del Producto en CJ
                        </label>
                        <Input
                            id="cjId"
                            value={cjId}
                            onChange={(e) => setCjId(e.target.value)}
                            placeholder="Ej: CCCCCCC123456"
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
                        disabled={!cjId.trim() || loading}
                        className="bg-[var(--gold)] text-[var(--ink)] hover:bg-[var(--gold-soft)]"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Importando...
                            </>
                        ) : (
                            "Importar Producto"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
