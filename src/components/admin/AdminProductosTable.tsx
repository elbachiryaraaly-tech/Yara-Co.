"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import { Search, ChevronLeft, ChevronRight, Pencil, Eye, Trash2, Loader2, Star } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Product, ProductImage } from "@prisma/client";

type ProductWithRelations = Product & {
  images: ProductImage[];
  category: { name: string } | null;
  provider: { name: string } | null;
};

export function AdminProductosTable({
  products,
  total,
  page,
  totalPages,
  initialSearch = "",
}: {
  products: ProductWithRelations[];
  total: number;
  page: number;
  totalPages: number;
  initialSearch?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isTogglingFeatured, setIsTogglingFeatured] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    try {
      setIsDeleting(id);
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al eliminar el producto");
      }

      toast({
        title: "Producto eliminado",
        description: `El producto "${name}" ha sido eliminado.`,
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado",
        variant: "error",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      setIsTogglingFeatured(id);
      const res = await fetch(`/api/admin/products/${id}/featured`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !currentFeatured }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar destacado");
      toast({
        title: currentFeatured ? "Quitado de destacados" : "Añadido a destacados",
        description: currentFeatured
          ? "El producto ya no se mostrará en la página principal."
          : "El producto se mostrará en la sección Destacados de la página principal.",
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo actualizar el destacado",
        variant: "error",
      });
    } finally {
      setIsTogglingFeatured(null);
    }
  };

  const updateParams = (updates: Record<string, string | number>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v === "" || v === 1) next.delete(k);
      else next.set(k, String(v));
    });
    router.push(`/admin/productos?${next.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ q: search, page: 1 });
  };

  const imageUrl = (p: ProductWithRelations) => {
    let url = p.images[0]?.url;
    if (!url) return "https://images.unsplash.com/photo-1541643600914-78b084683601?w=80&q=80";

    // Si la URL es un array JSON de la antigua importación rota, intentamos parsearlo
    if (url.startsWith("['") || url.startsWith('["')) {
      try {
        const parsed = JSON.parse(url.replace(/'/g, '"'));
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0];
        }
      } catch (e) {
        // Ignorar
      }
    }
    return url;
  };

  return (
    <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)] overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4 border-b border-[var(--border)] flex flex-wrap items-center gap-4">
          <form onSubmit={handleSearch} className="flex-1 min-w-[200px] flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, slug o SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-[var(--elevated)] border-[var(--border)]"
              />
            </div>
            <Button type="submit" variant="outline" className="rounded-lg border-[var(--border)]">
              Buscar
            </Button>
          </form>
        </div>

        {products.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            {initialSearch
              ? "No hay productos que coincidan con la búsqueda."
              : "Aún no hay productos. Añade el primero desde el botón superior."}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="pb-3 px-6 font-medium w-14">Imagen</th>
                    <th className="pb-3 px-6 font-medium">Producto</th>
                    <th className="pb-3 px-6 font-medium">SKU</th>
                    <th className="pb-3 px-6 font-medium">Precio</th>
                    <th className="pb-3 px-6 font-medium">Stock</th>
                    <th className="pb-3 px-6 font-medium">Categoría</th>
                    <th className="pb-3 px-6 font-medium">Proveedor</th>
                    <th className="pb-3 px-6 font-medium">Estado</th>
                    <th className="pb-3 px-6 font-medium text-center w-24" title="Mostrar en página principal">
                      Destacado
                    </th>
                    <th className="pb-3 px-6 font-medium w-32">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-[var(--border)] hover:bg-[var(--elevated)]/50 transition-colors"
                    >
                      <td className="py-3 px-6">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[var(--elevated)]">
                          <Image
                            src={imageUrl(p)}
                            alt={p.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-6">
                        <Link
                          href={`/admin/productos/${p.id}/editar`}
                          className="font-medium text-[var(--foreground)] hover:text-[var(--gold)] hover:underline"
                        >
                          {p.name}
                        </Link>
                        <span className="block text-xs text-muted-foreground">{p.slug}</span>
                      </td>
                      <td className="py-3 px-6 text-muted-foreground font-mono text-sm">
                        {p.sku ?? "—"}
                      </td>
                      <td className="py-3 px-6 font-semibold text-[var(--gold)]">
                        {formatPrice(Number(p.price))}
                      </td>
                      <td className="py-3 px-6">{p.stock}</td>
                      <td className="py-3 px-6 text-muted-foreground text-sm">
                        {p.category?.name ?? "—"}
                      </td>
                      <td className="py-3 px-6 text-sm">
                        {p.provider ? (
                          <span className="text-[var(--gold)] font-medium">{p.provider.name}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-3 px-6">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${p.isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-[var(--muted)]/30 text-muted-foreground"
                            }`}
                        >
                          {p.isActive ? "Activo" : "Oculto"}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-9 w-9 rounded-lg transition-colors ${p.isFeatured ? "text-[var(--gold)] hover:bg-[var(--gold)]/10" : "text-muted-foreground hover:text-[var(--foreground)]"}`}
                          onClick={() => handleToggleFeatured(p.id, p.isFeatured)}
                          disabled={isTogglingFeatured === p.id}
                          title={p.isFeatured ? "Quitar de destacados (página principal)" : "Marcar como destacado (mostrar en página principal)"}
                        >
                          {isTogglingFeatured === p.id ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Star className={`h-5 w-5 ${p.isFeatured ? "fill-current" : ""}`} />
                          )}
                        </Button>
                      </td>
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="rounded-lg border-[var(--border)]" asChild>
                            <Link href={`/admin/productos/${p.id}/editar`} className="gap-1.5">
                              <Pencil className="h-4 w-4" />
                              Editar
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-[var(--foreground)]" asChild>
                            <Link href={`/productos/${p.slug}`} target="_blank" title="Ver en tienda">
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg text-red-500/70 hover:text-red-500 hover:bg-red-500/10"
                                disabled={isDeleting === p.id}
                                title="Eliminar producto"
                              >
                                {isDeleting === p.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-[var(--card)] border-[var(--border)] max-w-md">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-[var(--foreground)] font-display text-xl">¿Eliminar producto?</AlertDialogTitle>
                                <AlertDialogDescription className="text-muted-foreground">
                                  Estás a punto de eliminar el producto <strong>{p.name}</strong>. Esta acción eliminará permanentemente el producto, sus fotos y sus variantes de la base de datos.
                                  ¿Estás seguro de que deseas continuar?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="mt-6 border-t border-[var(--border)] pt-4">
                                <AlertDialogCancel className="bg-[var(--elevated)] border-transparent text-[var(--foreground)] hover:bg-[var(--elevated)]/80 hover:border-[var(--border)]">
                                  Cancelar
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleDelete(p.id, p.name);
                                  }}
                                  className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20"
                                >
                                  Sí, eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="p-4 border-t border-[var(--border)] flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Página {page} de {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg border-[var(--border)]"
                    disabled={page <= 1}
                    onClick={() => updateParams({ page: page - 1 })}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg border-[var(--border)]"
                    disabled={page >= totalPages}
                    onClick={() => updateParams({ page: page + 1 })}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
