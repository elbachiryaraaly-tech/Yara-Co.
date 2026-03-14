"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { AlertCircle, Package } from "lucide-react";
import { formatPrice, cn, getImageUrl } from "@/lib/utils";

export interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number | null;
  image: string;
  images?: string[];
  badge?: string | null;
  rating?: number | null;
  reviewCount?: number;
  className?: string;
  /** Si true, la card es más grande (destacada) */
  featured?: boolean;
  /** Stock information */
  stock?: number;
  variants?: Array<{ stock: number }>;
  /** Si es false, no se muestra "Agotado" aunque el stock sea 0 (ej. productos gestionados por CJ) */
  trackInventory?: boolean;
}

export function ProductCard({
  name,
  slug,
  price,
  compareAtPrice,
  image,
  badge,
  rating,
  reviewCount = 0,
  className,
  featured = false,
  stock,
  variants,
  trackInventory = true,
}: ProductCardProps) {
  const [hover, setHover] = React.useState(false);
  const discount = compareAtPrice
    ? Math.round(((Number(compareAtPrice) - price) / Number(compareAtPrice)) * 100)
    : 0;

  // Calculate stock status
  const totalStock = React.useMemo(() => {
    if (!trackInventory) return Number.POSITIVE_INFINITY;
    if (stock !== undefined) return stock;
    if (variants) {
      return variants.reduce((total, variant) => total + Math.max(0, variant.stock), 0);
    }
    return 0;
  }, [stock, variants, trackInventory]);

  const isOutOfStock = trackInventory && totalStock <= 0;
  const isLowStock = trackInventory && totalStock > 0 && totalStock <= 5;

  return (
    <motion.article
      className={cn("group relative perspective-3d", className)}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      whileHover={featured ? { scale: 1.02 } : { y: -8, scale: 1.02 }}
    >
      <Link href={`/productos/${slug}`} className="block">
        <motion.div
          className={cn(
            "relative overflow-hidden bg-[var(--elevated)] transition-all duration-700 ease-out transform-3d",
            featured ? "aspect-[4/5]" : "aspect-[4/5]",
            !featured && "shadow-[0_24px_48px_-12px_rgba(0,0,0,0.4)]",
            !featured && hover && "shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6),0_0_40px_rgba(184,168,138,0.2)]"
          )}
          whileHover={{ rotateY: featured ? 0 : 2, rotateX: featured ? 0 : -2 }}
          transition={{ duration: 0.5 }}
        >
          <Image
            src={getImageUrl(image)}
            alt={name}
            fill
            className={cn(
              "object-cover transition-all duration-1000 ease-out",
              hover ? "scale-110 brightness-110" : "scale-100 brightness-100",
              isOutOfStock && "grayscale opacity-75"
            )}
            sizes={featured ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"}
          />
          {/* Overlay mejorado con gradiente */}
          <motion.div
            className={cn(
              "absolute inset-0 transition-all duration-700",
              hover
                ? "bg-gradient-to-t from-[var(--ink)]/60 via-[var(--ink)]/20 to-transparent"
                : "bg-gradient-to-t from-[var(--ink)]/30 via-transparent to-transparent",
              isOutOfStock && "bg-black/40"
            )}
          />
          {/* Out of stock overlay */}
          {isOutOfStock && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/60 z-20 flex items-center justify-center"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2"
                >
                  <AlertCircle className="h-6 w-6 text-white" />
                </motion.div>
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-white font-bold text-sm uppercase tracking-wider"
                >
                  Agotado
                </motion.span>
              </div>
            </motion.div>
          )}
          {/* Low stock indicator */}
          {!isOutOfStock && isLowStock && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-4 right-4 bg-amber-500 text-white px-2 py-1 rounded-lg text-xs font-medium z-10 flex items-center gap-1"
            >
              <Package className="h-3 w-3" />
              ¡Últimas {totalStock}!
            </motion.div>
          )}
          {/* Efecto de brillo en hover */}
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            style={{
              background: "linear-gradient(135deg, transparent 0%, rgba(184, 168, 138, 0.1) 50%, transparent 100%)",
            }}
            animate={hover ? {
              backgroundPosition: ["0% 0%", "100% 100%"],
            } : {}}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          />
          {/* Badges mejorados */}
          <div className="absolute left-4 top-4 flex flex-col gap-2 z-10">
            {badge && (
              <motion.span
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--ink)] bg-[var(--paper)] shadow-lg"
              >
                {badge}
              </motion.span>
            )}
            {discount > 0 && !isOutOfStock && (
              <motion.span
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground bg-[var(--gold)] shadow-lg animate-pulse-glow"
              >
                −{discount}%
              </motion.span>
            )}
          </div>
          {/* Hover CTA mejorado */}
          <motion.div
            className={cn(
              "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[var(--paper)] to-[var(--paper)]/95 text-[var(--ink)] py-4 text-center text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 backdrop-blur-sm",
              hover ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <span>Ver producto</span>
            <motion.span
              className="text-[var(--gold)]"
              animate={hover ? { x: [0, 4, 0] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              →
            </motion.span>
          </motion.div>
          {/* Borde dorado en hover */}
          <motion.div
            className="absolute inset-0 border-2 border-[var(--gold)]/0 pointer-events-none"
            animate={hover ? { borderColor: "rgba(184, 168, 138, 0.4)" } : {}}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
        <motion.div
          className={cn("space-y-2", featured ? "mt-6" : "mt-5")}
          whileHover={{ x: 4 }}
          transition={{ duration: 0.3 }}
        >
          <h3
            className={cn(
              "font-display font-semibold text-[var(--foreground)] tracking-tight line-clamp-2 group-hover:text-[var(--gold)] transition-all duration-300",
              featured ? "text-xl lg:text-2xl" : "text-lg"
            )}
          >
            {name}
          </h3>
          <div className="flex items-baseline gap-3">
            <motion.span
              className={cn(
                "text-sm lg:text-base font-bold",
                isOutOfStock ? "text-gray-400 line-through" : "text-[var(--gold)]"
              )}
              whileHover={!isOutOfStock ? { scale: 1.05 } : {}}
            >
              {formatPrice(price)}
            </motion.span>
            {compareAtPrice && !isOutOfStock && (
              <span className="text-xs text-muted-foreground line-through opacity-60">
                {formatPrice(Number(compareAtPrice))}
              </span>
            )}
            {isOutOfStock && (
              <span className="text-xs text-red-400 font-medium">
                Agotado
              </span>
            )}
          </div>
          {rating != null && reviewCount > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <motion.span
                    key={i}
                    className={cn(
                      "text-xs",
                      i < Math.floor(Number(rating))
                        ? "text-[var(--gold)]"
                        : "text-muted-foreground/30"
                    )}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                  >
                    ★
                  </motion.span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {Number(rating).toFixed(1)} · {reviewCount} reseñas
              </p>
            </div>
          )}
        </motion.div>
      </Link>
    </motion.article>
  );
}
