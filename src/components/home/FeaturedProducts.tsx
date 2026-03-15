import Link from "next/link";
import { ProductCard } from "@/components/shop/ProductCard";
import { getFeaturedProducts } from "@/lib/products";
import { FeaturedProductsGrid } from "./FeaturedProductsGrid";

export async function FeaturedProducts() {
  const products = await getFeaturedProducts();

  return (
    <section className="py-24 lg:py-32 border-t border-[var(--gold)]/10 bg-[var(--card)]">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-16">
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-2">
              <span className="h-px w-12 bg-[var(--gold)]/80" />
              <p className="text-[var(--gold)] text-sm uppercase tracking-[0.25em] font-medium">
                Destacados
              </p>
            </div>
            <h2 className="font-display text-display-sm text-[var(--foreground)] tracking-tighter">
              Los favoritos de nuestros clientes
            </h2>
          </div>
          <Link
            href="/productos"
            className="text-sm font-medium text-[var(--foreground)]/75 hover:text-[var(--gold)] uppercase tracking-[0.18em] shrink-0 relative group/link"
          >
            Ver todos
            <span className="absolute bottom-0 left-0 w-0 h-px bg-[var(--gold)] transition-all duration-300 group-hover/link:w-full" />
          </Link>
        </div>

        <FeaturedProductsGrid products={products} />
      </div>
    </section>
  );
}
