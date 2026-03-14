"use client";

import { motion } from "framer-motion";
import { ProductCard } from "@/components/shop/ProductCard";

const FALLBACK_PRODUCTS = [
  {
    id: "1",
    name: "Eau de Parfum Midnight Oud",
    slug: "eau-de-parfum-midnight-oud",
    price: 89.99,
    compareAtPrice: 119.99,
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80",
    images: [] as { url: string }[],
    badge: "NUEVO",
    rating: 4.8,
    reviewCount: 124,
  },
  {
    id: "2",
    name: "Reloj Cronógrafo Luna Nova",
    slug: "reloj-cronografo-luna-nova",
    price: 299.99,
    compareAtPrice: null,
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80",
    images: [] as { url: string }[],
    badge: "EXCLUSIVO",
    rating: 4.9,
    reviewCount: 89,
  },
  {
    id: "3",
    name: "Collar Oro Rosa con Diamantes",
    slug: "collar-oro-rosa-diamantes",
    price: 199.99,
    compareAtPrice: 249.99,
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80",
    images: [] as { url: string }[],
    badge: "-20%",
    rating: 4.7,
    reviewCount: 56,
  },
  {
    id: "4",
    name: "Cartera de Piel Italiana",
    slug: "cartera-piel-italiana",
    price: 149.99,
    compareAtPrice: null,
    image: "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600&q=80",
    images: [] as { url: string }[],
    badge: null,
    rating: 4.6,
    reviewCount: 203,
  },
];

type Product = {
  id: string;
  name: string;
  slug: string;
  price: { toString(): string } | number;
  compareAtPrice: { toString(): string } | number | null;
  images: { url: string }[];
  badges: string[];
  rating: { toString(): string } | number | null;
  reviewCount: number;
  stock?: number;
  trackInventory?: boolean;
  variants?: { stock: number }[];
};

function toCardProduct(p: Product | (typeof FALLBACK_PRODUCTS)[0]) {
  const price = typeof p.price === "number" ? p.price : Number(p.price);
  const compareAtPrice = p.compareAtPrice ? Number(p.compareAtPrice) : null;
  const images = "images" in p && Array.isArray(p.images) ? p.images : [{ url: (p as (typeof FALLBACK_PRODUCTS)[0]).image }];
  const badges = "badges" in p && Array.isArray(p.badges) ? p.badges : (p as (typeof FALLBACK_PRODUCTS)[0]).badge ? [(p as (typeof FALLBACK_PRODUCTS)[0]).badge!] : [];
  const rating = p.rating != null ? Number(p.rating) : null;
  const reviewCount = p.reviewCount ?? 0;
  const variants = "variants" in p ? p.variants : undefined;
  const stock = "stock" in p ? (p as Product).stock : undefined;
  const trackInventory = "trackInventory" in p ? (p as Product).trackInventory : undefined;
  
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price,
    compareAtPrice,
    image: images[0]?.url ?? "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80",
    badge: badges[0],
    rating,
    reviewCount,
    stock: stock ?? 0,
    trackInventory: trackInventory ?? true,
    variants,
  };
}

export function FeaturedProductsGrid({ products }: { products: Product[] }) {
  const list = products.length > 0 ? products : FALLBACK_PRODUCTS;
  const cardProducts = list.map((p) => toCardProduct(p as Product));
  const [first, ...rest] = cardProducts;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 auto-rows-fr">
      {first && (
        <motion.div
          className="col-span-2 row-span-2 min-h-[320px] lg:min-h-0"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <ProductCard
            {...first}
            featured
            images={[]}
          />
        </motion.div>
      )}
      {rest.map((product, i) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ delay: 0.1 + i * 0.05, duration: 0.5 }}
        >
          <ProductCard
            {...product}
            images={[]}
          />
        </motion.div>
      ))}
    </div>
  );
}
