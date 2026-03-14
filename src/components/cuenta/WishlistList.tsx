"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { ProductCard } from "@/components/shop/ProductCard";
import { Trash2 } from "lucide-react";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80";

type WishlistItem = {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice: number | null;
    image: string | null;
    badge: string | null;
    rating: number | null;
    reviewCount: number;
  };
};

export function WishlistList({ initialItems }: { initialItems: WishlistItem[] }) {
  const [items, setItems] = useState(initialItems);

  const remove = async (productId: string) => {
    await fetch(`/api/wishlist?productId=${encodeURIComponent(productId)}`, {
      method: "DELETE",
    });
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {items.map((item) => (
        <div
          key={item.id}
          className="group relative rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden"
        >
          <Link href={`/productos/${item.product.slug}`} className="block">
            <div className="relative aspect-square">
              <Image
                src={item.product.image ?? FALLBACK_IMAGE}
                alt={item.product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>
            <div className="p-4">
              <p className="font-medium text-[var(--foreground)] group-hover:text-[var(--gold)]">
                {item.product.name}
              </p>
              <p className="text-[var(--gold)] mt-1">{formatPrice(item.product.price)}</p>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-400/10"
            onClick={() => remove(item.productId)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
