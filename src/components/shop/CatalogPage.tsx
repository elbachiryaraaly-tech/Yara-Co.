"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/shop/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

type Category = { id: string; name: string; slug: string };
type Product = {
  id: string;
  name: string;
  slug: string;
  price: { toString(): string };
  compareAtPrice: { toString(): string } | null;
  images: { url: string }[];
  badges: string[];
  rating: { toString(): string } | null;
  reviewCount: number;
};

export function CatalogPage({
  products,
  total,
  page,
  totalPages,
  categories,
  currentCategory,
  currentSort,
  currentSearch,
}: {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
  categories: Category[];
  currentCategory?: string;
  currentSort: string;
  currentSearch?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = React.useState(currentSearch ?? "");
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);

  const updateParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === "") params.delete(key);
      else params.set(key, value);
    });
    params.delete("pagina"); // reset page when changing filters
    if (updates.pagina) params.set("pagina", updates.pagina);
    router.push(`/productos?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ q: searchInput || undefined });
  };

  return (
    <div className="container mx-auto px-6 lg:px-12 py-16">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar filters */}
        <aside
          className={cn(
            "md:w-64 shrink-0 space-y-6",
            mobileFiltersOpen ? "block" : "hidden md:block"
          )}
        >
          <div className="sticky top-24 space-y-6">
            <div>
              <h3 className="font-display font-semibold text-[var(--foreground)] mb-3">Categorías</h3>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => updateParams({ categoria: undefined })}
                    className={cn(
                      "block w-full text-left py-2 px-3 rounded-lg text-sm transition-colors",
                      !currentCategory ? "bg-[var(--gold)]/20 text-[var(--gold)]" : "text-[var(--foreground)]/80 hover:bg-[var(--elevated)]"
                    )}
                  >
                    Todas
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => updateParams({ categoria: cat.slug })}
                      className={cn(
                        "block w-full text-left py-2 px-3 rounded-lg text-sm transition-colors",
                        currentCategory === cat.slug ? "bg-gold/20 text-gold" : "text-white/80 hover:bg-white/10"
                      )}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-4 mb-8">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
              <Input
                placeholder="Buscar productos..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={currentSort} onValueChange={(v) => updateParams({ orden: v })}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ordenar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Más recientes</SelectItem>
                <SelectItem value="price_asc">Precio: menor a mayor</SelectItem>
                <SelectItem value="price_desc">Precio: mayor a menor</SelectItem>
                <SelectItem value="rating">Mejor valorados</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              className="md:hidden"
              onClick={() => setMobileFiltersOpen((o) => !o)}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </form>

          <p className="text-muted-foreground text-sm mb-6">
            {total} producto{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
          </p>

          {products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No hay productos que coincidan con tu búsqueda.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push("/productos")}
              >
                Ver todos
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    slug={product.slug}
                    price={Number(product.price)}
                    compareAtPrice={product.compareAtPrice ? Number(product.compareAtPrice) : null}
                    image={product.images[0]?.url ?? "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80"}
                    images={product.images.map((img) => img.url)}
                    badge={product.badges?.[0]}
                    rating={product.rating ? Number(product.rating) : null}
                    reviewCount={product.reviewCount}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-12">
                  <Button
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => updateParams({ pagina: String(page - 1) })}
                  >
                    Anterior
                  </Button>
                  <span className="flex items-center px-4 text-[var(--foreground)]/80">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={page >= totalPages}
                    onClick={() => updateParams({ pagina: String(page + 1) })}
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
