"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Share2, Truck, Shield, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice, cn, getImageUrl } from "@/lib/utils";
import { useCart } from "@/components/providers/CartProvider";

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: { toString(): string };
  compareAtPrice: { toString(): string } | null;
  rating: { toString(): string } | null;
  reviewCount: number;
  images: { id: string; url: string; alt: string | null }[];
  variants: { id: string; name: string; price: { toString(): string }; stock: number }[];
  category: { name: string; slug: string } | null;
};

export function ProductDetail({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = React.useState(0);
  const [quantity, setQuantity] = React.useState(1);
  const [selectedVariant, setSelectedVariant] = React.useState(product.variants[0] ?? null);
  const [added, setAdded] = React.useState(false);
  const [adding, setAdding] = React.useState(false);
  const [error, setError] = React.useState(false);
  const handleAddToCart = async () => {
    setAdding(true);
    setError(false);
    const ok = await addToCart(product.id, quantity, selectedVariant?.id ?? null);
    setAdding(false);
    if (ok) {
      setAdded(true);
      setTimeout(() => setAdded(false), 3500);
    } else {
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  };

  const price = selectedVariant ? Number(selectedVariant.price) : Number(product.price);
  const compareAtPrice = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const discount = compareAtPrice ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) : 0;
  const images = product.images.length > 0 ? product.images : [{ id: "0", url: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80", alt: product.name }];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-[var(--elevated)]">
            <Image
              src={getImageUrl(images[selectedImage].url)}
              alt={images[selectedImage].alt ?? product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            {discount > 0 && (
              <span className="absolute left-4 top-4 rounded-full bg-red-600 px-3 py-1 text-sm font-semibold text-white">
                -{discount}%
              </span>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setSelectedImage(i)}
                className={cn(
                  "relative h-20 w-20 shrink-0 rounded-lg overflow-hidden border-2 transition-colors",
                  selectedImage === i ? "border-[var(--gold)]" : "border-transparent hover:border-[var(--border)]"
                )}
              >
                <Image src={getImageUrl(img.url)} alt={img.alt ?? ""} fill className="object-cover" sizes="80px" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          {product.category && (
            <Link
              href={`/productos?categoria=${product.category.slug}`}
              className="text-gold text-sm font-medium hover:underline"
            >
              {product.category.name}
            </Link>
          )}
          <h1 className="font-display text-4xl md:text-5xl font-bold text-[var(--foreground)] mt-2 mb-4">
            {product.name}
          </h1>

          <div className="flex items-center gap-4 mb-6">
            <span className="text-2xl font-semibold text-[var(--gold)]">{formatPrice(price)}</span>
            {compareAtPrice && (
              <span className="text-lg text-muted-foreground line-through">{formatPrice(compareAtPrice)}</span>
            )}
            {product.rating != null && (
              <span className="flex items-center gap-1 text-[var(--foreground)]/80">
                <span className="text-gold">★</span> {Number(product.rating).toFixed(1)} ({product.reviewCount} reseñas)
              </span>
            )}
          </div>

          {product.description && (
            <div
              className="text-[var(--foreground)]/80 mb-8 leading-relaxed prose prose-sm md:prose-base dark:prose-invert max-w-none 
                         [&>p]:mb-4 [&>img]:rounded-xl [&>img]:my-6 [&>ul]:list-disc [&>ul]:ml-6 [&>ol]:list-decimal [&>ol]:ml-6 [&_b]:text-[var(--foreground)] [&_strong]:text-[var(--foreground)]"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          )}

          {/* Variants */}
          {product.variants.length > 0 && (
            <div className="mb-8">
              <p className="text-sm font-medium text-[var(--foreground)]/90 mb-2">Variante</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={cn(
                      "px-4 py-2 rounded-lg border text-sm transition-colors",
                      selectedVariant?.id === v.id
                        ? "border-gold bg-gold/20 text-gold"
                        : "border-white/20 text-[var(--foreground)]/80 hover:border-white/40"
                    )}
                  >
                    {v.name} — {formatPrice(Number(v.price))}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-8">
            <p className="text-sm font-medium text-[var(--foreground)]/90 mb-2">Cantidad</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center rounded-lg border border-white/20 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="h-12 w-12 flex items-center justify-center text-[var(--foreground)]/80 hover:bg-[var(--elevated)]"
                >
                  −
                </button>
                <span className="h-12 w-14 flex items-center justify-center text-[var(--foreground)] font-medium">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="h-12 w-12 flex items-center justify-center text-[var(--foreground)]/80 hover:bg-[var(--elevated)]"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mb-8">
            <div className="flex flex-col gap-2 w-full">
              <Button
                size="lg"
                className="flex-1 min-w-[200px] rounded-xl py-6"
                onClick={handleAddToCart}
                disabled={adding}
              >
                {adding ? "Añadiendo…" : added ? "Añadido al carrito" : "Añadir al carrito"}
              </Button>
              {added && (
                <p className="text-sm text-emerald-400 flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0" />
                  Producto añadido. <Link href="/carrito" className="text-[var(--gold)] hover:underline font-medium">Ver carrito</Link>
                </p>
              )}
              {error && (
                <p className="text-sm text-red-400">No se pudo añadir. Inténtalo de nuevo.</p>
              )}
            </div>
            <Button size="icon" variant="outline" className="rounded-xl h-14 w-14">
              <Heart className="h-6 w-6" />
            </Button>
            <Button size="icon" variant="outline" className="rounded-xl h-14 w-14">
              <Share2 className="h-6 w-6" />
            </Button>
          </div>

          {/* Trust */}
          <div className="grid grid-cols-2 gap-4 p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-[var(--gold)]" />
              <span className="text-sm text-[var(--foreground)]/80">Envío gratis +50€</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-gold" />
              <span className="text-sm text-[var(--foreground)]/80">Garantía 2 años</span>
            </div>
            <div className="flex items-center gap-3 col-span-2">
              <Check className="h-5 w-5 text-emerald-500" />
              <span className="text-sm text-[var(--foreground)]/80">Pago seguro · Devoluciones en 30 días</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
