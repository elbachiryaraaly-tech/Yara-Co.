"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { formatPrice, getImageUrl } from "@/lib/utils";
import { ShoppingBag, Truck, Trash2 } from "lucide-react";
import { ProductCard } from "@/components/shop/ProductCard";
import { useCart } from "@/components/providers/CartProvider";

const FREE_SHIPPING_THRESHOLD = 150;
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80";

const SUGGESTED_PRODUCTS = [
  { id: "1", name: "Eau de Parfum Midnight Oud", slug: "eau-de-parfum-midnight-oud", price: 89.99, compareAtPrice: 119.99, image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80", badge: "NUEVO", rating: 4.8, reviewCount: 124 },
  { id: "2", name: "Reloj Cronógrafo Luna Nova", slug: "reloj-cronografo-luna-nova", price: 299.99, compareAtPrice: null, image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80", badge: "EXCLUSIVO", rating: 4.9, reviewCount: 89 },
  { id: "3", name: "Cartera de Piel Italiana", slug: "cartera-piel-italiana", price: 149.99, compareAtPrice: null, image: "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600&q=80", badge: null, rating: 4.6, reviewCount: 203 },
];

export function CartContent() {
  const { items, isLoading, removeFromCart } = useCart();

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const hasFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-12 text-center text-muted-foreground">
        Cargando carrito…
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {items.length > 0 && (
        <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-6">
          <div className="flex items-center justify-between gap-4 mb-3">
            <span className="flex items-center gap-2 text-[var(--foreground)] font-medium">
              <Truck className="h-5 w-5 text-[var(--gold)]" />
              {hasFreeShipping
                ? "¡Envío gratis desbloqueado!"
                : `Te faltan ${formatPrice(remainingForFreeShipping)} para envío gratis`}
            </span>
            {!hasFreeShipping && (
              <span className="text-sm text-muted-foreground">
                {formatPrice(subtotal)} / {formatPrice(FREE_SHIPPING_THRESHOLD)}
              </span>
            )}
          </div>
          <div className="h-2 rounded-full bg-[var(--elevated)] overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--gold)] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <>
          <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-12 lg:p-20 text-center relative overflow-hidden">
            <div className="absolute inset-0 grain" />
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--elevated)] border border-[var(--border)] mb-6">
                <ShoppingBag className="h-10 w-10 text-[var(--gold)]" />
              </div>
              <h2 className="font-display text-2xl lg:text-3xl font-semibold text-[var(--foreground)] mb-2">
                Tu carrito está vacío
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                Añade piezas que te inspiren. Envío gratis en pedidos superiores a {formatPrice(FREE_SHIPPING_THRESHOLD)}.
              </p>
              <Button
                asChild
                className="rounded-lg bg-[var(--gold)] text-[var(--ink)] hover:bg-[var(--gold-soft)] font-medium"
                size="lg"
              >
                <Link href="/productos">Explorar productos</Link>
              </Button>
            </div>
          </div>
          <section className="pt-8 border-t border-[var(--border)]">
            <h3 className="font-display text-xl font-semibold text-[var(--foreground)] mb-6">
              Te puede gustar
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {SUGGESTED_PRODUCTS.map((p) => (
                <ProductCard key={p.id} {...p} />
              ))}
            </div>
          </section>
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-6 p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)]"
              >
                <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-[var(--elevated)] shrink-0">
                  <Image
                    src={getImageUrl(item.image ?? FALLBACK_IMAGE)}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/productos/${item.slug}`}
                    className="font-medium text-[var(--foreground)] hover:text-[var(--gold)] transition-colors"
                  >
                    {item.name}
                  </Link>
                  <p className="text-[var(--gold)] mt-1">{formatPrice(item.price)}</p>
                  <p className="text-muted-foreground text-sm">Cantidad: {item.quantity}</p>
                </div>
                <div className="text-right flex flex-col items-end justify-between">
                  <p className="font-semibold text-[var(--foreground)]">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-red-400 hover:bg-red-400/10"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div>
            <div className="sticky top-28 p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
              <h3 className="font-display text-xl font-semibold text-[var(--foreground)] mb-4">
                Resumen
              </h3>
              <div className="flex justify-between text-muted-foreground mb-2">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground mb-4">
                <span>Envío</span>
                <span>{hasFreeShipping ? "Gratis" : "Calculado en checkout"}</span>
              </div>
              <div className="border-t border-[var(--border)] pt-4 flex justify-between text-lg font-semibold text-[var(--foreground)] mb-6">
                <span>Total</span>
                <span className="text-[var(--gold)]">{formatPrice(subtotal)}</span>
              </div>
              <Button
                asChild
                className="w-full rounded-lg bg-[var(--gold)] text-[var(--ink)] hover:bg-[var(--gold-soft)] font-medium"
                size="lg"
              >
                <Link href="/checkout">Ir al checkout</Link>
              </Button>
              <Button variant="outline" asChild className="w-full mt-3 rounded-lg border-[var(--border)]">
                <Link href="/productos">Seguir comprando</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
