import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getWishlistItems } from "@/lib/wishlist";
import { getProducts } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { Heart, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { ProductCard } from "@/components/shop/ProductCard";
import { WishlistList } from "@/components/cuenta/WishlistList";

export default async function WishlistPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/cuenta/wishlist");

  const [items, suggested] = await Promise.all([
    getWishlistItems(),
    getProducts({ limit: 3, sort: "newest" }).then((r) => r.products).catch(() => []),
  ]);

  return (
    <div className="space-y-12">
      <div>
        <p className="text-[var(--gold)] text-sm uppercase tracking-[0.2em] mb-2">
          Lista de deseos
        </p>
        <h1 className="font-display text-4xl font-bold text-[var(--foreground)] tracking-tight">
          Tus productos guardados
        </h1>
        <p className="mt-2 text-muted-foreground">
          Añade productos desde la tienda y aparecerán aquí.
        </p>
      </div>

      {items.length > 0 ? (
        <WishlistList initialItems={items} />
      ) : (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
          <div className="flex flex-col items-center justify-center py-20 px-6">
            <div className="rounded-full bg-[var(--gold)]/10 p-6 mb-6">
              <Heart className="h-14 w-14 text-[var(--gold)]" />
            </div>
            <h2 className="font-display text-2xl font-semibold text-[var(--foreground)] mb-2 text-center">
              Tu lista está vacía
            </h2>
            <p className="text-muted-foreground text-center max-w-md mb-8">
              Guarda tus productos favoritos con el corazón para comprarlos más tarde.
            </p>
            <Button asChild size="lg" className="rounded-lg gap-2">
              <Link href="/productos">
                Explorar productos
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      )}

      <section>
        <h2 className="font-display text-2xl font-semibold text-[var(--foreground)] mb-6">
          Te puede gustar
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {suggested.slice(0, 3).map((p) => (
            <ProductCard
              key={p.id}
              id={p.id}
              name={p.name}
              slug={p.slug}
              price={Number(p.price)}
              compareAtPrice={p.compareAtPrice ? Number(p.compareAtPrice) : null}
              image={p.images[0]?.url ?? "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80"}
              badge={p.badges[0] ?? undefined}
              rating={p.rating ? Number(p.rating) : undefined}
              reviewCount={p.reviewCount}
            />
          ))}
        </div>
        <Button variant="outline" asChild className="mt-8 rounded-lg">
          <Link href="/productos">Ver todos los productos</Link>
        </Button>
      </section>
    </div>
  );
}
