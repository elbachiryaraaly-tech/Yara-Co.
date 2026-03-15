import Link from "next/link";
import { ProductCard } from "@/components/shop/ProductCard";
import { getFeaturedProducts } from "@/lib/products";
import { FeaturedProductsGrid } from "./FeaturedProductsGrid";
import { FeaturedProductsHead } from "./FeaturedProductsHead";

export async function FeaturedProducts() {
  const products = await getFeaturedProducts();

  return (
    <section className="py-24 lg:py-32 border-t border-[var(--gold)]/10 bg-[var(--card)]">
      <div className="container mx-auto px-6 lg:px-12">
        <FeaturedProductsHead />

        <FeaturedProductsGrid products={products} />
      </div>
    </section>
  );
}
