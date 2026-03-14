import Link from "next/link";
import { ProductCard } from "@/components/shop/ProductCard";
import { getFeaturedProducts } from "@/lib/products";
import { FeaturedProductsGrid } from "./FeaturedProductsGrid";

export async function FeaturedProducts() {
  const products = await getFeaturedProducts();

  return (
    <section className="py-24 lg:py-32 border-t border-[var(--border)]">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-16">
          <div>
            <p className="text-[var(--gold)] text-sm uppercase tracking-[0.2em] mb-2">
              Destacados
            </p>
            <h2 className="font-display text-display-sm text-[var(--foreground)] tracking-tighter">
              Los favoritos de nuestros clientes
            </h2>
          </div>
          <Link
            href="/productos"
            className="text-sm font-medium text-[var(--foreground)]/80 hover:text-[var(--gold)] uppercase tracking-wider link-underline shrink-0"
          >
            Ver todos
          </Link>
        </div>

        <FeaturedProductsGrid products={products} />
      </div>
    </section>
  );
}
