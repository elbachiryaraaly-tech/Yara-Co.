"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Share2, Truck, Shield, Check, Package, AlertCircle } from "lucide-react";
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
  variants: { id: string; name: string; price: { toString(): string }; stock: number; sku?: string | null }[];
  category: { name: string; slug: string } | null;
  trackInventory?: boolean;
};

export function ProductDetail({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const trackInventory = product.trackInventory ?? true;
  const [selectedImage, setSelectedImage] = React.useState(0);
  const [quantity, setQuantity] = React.useState(1);
  const [selectedVariant, setSelectedVariant] = React.useState(product.variants[0] ?? null);
  const [added, setAdded] = React.useState(false);
  const [adding, setAdding] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [stockError, setStockError] = React.useState<string | null>(null);
  const [showOnlyAvailable, setShowOnlyAvailable] = React.useState(trackInventory);

  // Auto-select first available variant if current selection is out of stock
  React.useEffect(() => {
    if (!trackInventory) return;
    if (selectedVariant && selectedVariant.stock <= 0) {
      const firstAvailable = product.variants.find(v => v.stock > 0);
      if (firstAvailable) {
        setSelectedVariant(firstAvailable);
        setQuantity(1);
      }
    }
  }, [selectedVariant, product.variants]);

  // Reset quantity when variant changes
  React.useEffect(() => {
    setQuantity(1);
    setStockError(null);
  }, [selectedVariant]);

  // Calculate available stock
  const availableStock = !trackInventory
    ? Number.POSITIVE_INFINITY
    : selectedVariant
      ? selectedVariant.stock
      : 0;
  const isOutOfStock = trackInventory && availableStock <= 0;
  const isLowStock = trackInventory && availableStock > 0 && availableStock <= 5;
  const maxQuantity = trackInventory ? Math.min(availableStock, 10) : 10; // Max 10 per order (lógica simple)

  // Check if entire product is out of stock (all variants)
  const isProductOutOfStock =
    trackInventory &&
    product.variants.length > 0 &&
    product.variants.every((variant) => variant.stock <= 0);
  
  // Check if product has low stock (any variant with <=5 units)
  const isProductLowStock =
    trackInventory &&
    product.variants.some((variant) => variant.stock > 0 && variant.stock <= 5);
  
  // Calculate total available stock across all variants
  const totalAvailableStock = trackInventory
    ? product.variants.reduce((total, variant) => total + Math.max(0, variant.stock), 0)
    : Number.POSITIVE_INFINITY;

  const handleAddToCart = async () => {
    // Stock validation
    if (!selectedVariant) {
      setStockError('Por favor selecciona una variante');
      return;
    }
    
    if (trackInventory && isOutOfStock) {
      setStockError('Esta variante está agotada');
      return;
    }
    
    if (trackInventory && quantity > availableStock) {
      setStockError(`Solo quedan ${availableStock} unidades disponibles`);
      return;
    }

    setAdding(true);
    setError(false);
    setStockError(null);
    
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

  const handleQuantityChange = (newQuantity: number) => {
    const clampedQuantity = Math.max(1, Math.min(newQuantity, maxQuantity));
    setQuantity(clampedQuantity);
    
    if (clampedQuantity > availableStock) {
      setStockError(`Solo quedan ${availableStock} unidades`);
    } else {
      setStockError(null);
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
            
            {/* Discount badge */}
            {discount > 0 && !isProductOutOfStock && (
              <span className="absolute left-4 top-4 rounded-full bg-red-600 px-3 py-1 text-sm font-semibold text-white z-10">
                -{discount}%
              </span>
            )}
            
            {/* Out of stock overlay */}
            {isProductOutOfStock && (
              <div className="absolute inset-0 bg-black/60 z-20 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">AGOTADO</h2>
                  <p className="text-white/80 text-sm px-4">
                    Este producto está temporalmente no disponible
                  </p>
                </div>
              </div>
            )}
            
            {/* Low stock indicator */}
            {!isProductOutOfStock && isProductLowStock && (
              <div className="absolute left-4 bottom-4 bg-amber-500 text-white px-3 py-2 rounded-lg text-sm font-medium z-10 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                ¡Últimas unidades!
              </div>
            )}
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setSelectedImage(i)}
                className={cn(
                  "relative h-20 w-20 shrink-0 rounded-lg overflow-hidden border-2 transition-colors",
                  selectedImage === i ? "border-[var(--gold)]" : "border-transparent hover:border-white/40"
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
            <span className={cn(
              "text-2xl font-semibold",
              isProductOutOfStock ? "text-gray-400 line-through" : "text-[var(--gold)]"
            )}>
              {formatPrice(price)}
            </span>
            {compareAtPrice && !isProductOutOfStock && (
              <span className="text-lg text-muted-foreground line-through">{formatPrice(compareAtPrice)}</span>
            )}
            {product.rating != null && (
              <span className="flex items-center gap-1 text-[var(--foreground)]/80">
                <span className="text-gold">★</span> {Number(product.rating).toFixed(1)} ({product.reviewCount} reseñas)
              </span>
            )}
          </div>

          {/* Product-level stock status banner */}
          {isProductOutOfStock && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-red-400 mb-1">Producto Agotado</h3>
                  <p className="text-sm text-red-400/80">
                    Lamentamos las molestias. Este producto está temporalmente no disponible. 
                    Te notificaremos cuando esté disponible nuevamente.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Low stock banner */}
          {!isProductOutOfStock && isProductLowStock && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-amber-400 mb-1">¡Últimas Oportunidades!</h3>
                  <p className="text-sm text-amber-400/80">
                    Solo quedan {totalAvailableStock} unidades en total. ¡No te quedes sin el tuyo!
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {product.description && (
            <div className="text-[var(--foreground)]/80 mb-8 leading-relaxed prose prose-sm md:prose-base dark:prose-invert max-w-none whitespace-pre-wrap">
              {product.description}
            </div>
          )}

          {/* Variants */}
          {product.variants.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]/90 mb-1">Selecciona una variante</p>
                  <p className="text-xs text-[var(--foreground)]/60">
                    {selectedVariant ? `${product.variants.length} opciones disponibles` : 'Elige una opción para continuar'}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {trackInventory && (
                    <button
                      type="button"
                      onClick={() => setShowOnlyAvailable((v) => !v)}
                      className={cn(
                        "text-xs px-3 py-1 rounded-full border transition-colors",
                        showOnlyAvailable
                          ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-300"
                          : "border-white/20 bg-transparent text-[var(--foreground)]/70 hover:border-white/40"
                      )}
                    >
                      {showOnlyAvailable ? "Mostrar todas las variantes" : "Solo mostrar disponibles"}
                    </button>
                  )}
                  {selectedVariant && (
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    <span className={cn(
                      "text-sm font-medium",
                      isOutOfStock ? "text-red-400" : isLowStock ? "text-amber-400" : "text-emerald-400"
                    )}>
                      {isOutOfStock ? 'Agotado' : isLowStock ? `¡Últimas ${availableStock} unidades!` : `${availableStock} disponibles`}
                    </span>
                  </div>
                  )}
                </div>
              </div>
              
              {/* Lista de variantes: agrupada y filtrable */}
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {product.variants
                  .filter((v) => !(trackInventory && showOnlyAvailable && v.stock <= 0))
                  .map((v, index) => {
                  const isSelected = selectedVariant?.id === v.id;
                  const variantOutOfStock = trackInventory && v.stock <= 0;
                  const variantLowStock = trackInventory && v.stock > 0 && v.stock <= 5;
                  const price = Number(v.price);
                  const hasDiscount = product.compareAtPrice && price < Number(product.compareAtPrice);
                  
                  return (
                    <motion.div
                      key={v.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <button
                        onClick={() => !variantOutOfStock && setSelectedVariant(v)}
                        disabled={variantOutOfStock}
                        className={cn(
                          "w-full relative p-4 rounded-xl border-2 transition-all duration-200 text-left overflow-hidden",
                          isSelected
                            ? "border-[var(--gold)] bg-[var(--gold)]/10 shadow-lg shadow-[var(--gold)]/20"
                            : variantOutOfStock
                            ? "border-red-500/30 bg-red-500/5 opacity-60 cursor-not-allowed"
                            : variantLowStock
                            ? "border-amber-500/50 bg-amber-500/5 hover:border-amber-500/70"
                            : "border-white/20 bg-[var(--card)] hover:border-white/40 hover:bg-[var(--elevated)] hover:shadow-md"
                        )}
                      >
                        {/* Stock status ribbon */}
                        {variantOutOfStock && (
                          <div className="absolute top-0 left-0 right-0 bg-red-500 text-white text-xs font-medium py-1 text-center">
                            AGOTADO
                          </div>
                        )}
                        
                        {variantLowStock && !variantOutOfStock && (
                          <div className="absolute top-0 left-0 bg-amber-500 text-white text-xs font-medium px-3 py-1 rounded-br-lg">
                            ¡Últimas {v.stock}!
                          </div>
                        )}
                        
                        {/* Selection indicator */}
                        {isSelected && !variantOutOfStock && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute right-4 top-4 w-6 h-6 rounded-full bg-[var(--gold)] flex items-center justify-center z-10"
                          >
                            <Check className="h-4 w-4 text-black" />
                          </motion.div>
                        )}
                        
                        <div className={cn("flex items-center justify-between", variantOutOfStock && "mt-4")}>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className={cn(
                                "font-semibold text-sm sm:text-base",
                                isSelected && !variantOutOfStock ? "text-[var(--gold)]" : 
                                variantOutOfStock ? "text-[var(--foreground)]/50" : "text-[var(--foreground)]"
                              )}>
                                {v.name}
                              </h3>
                              {hasDiscount && !variantOutOfStock && (
                                <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded-full">
                                  -{Math.round(((Number(product.compareAtPrice) - price) / Number(product.compareAtPrice)) * 100)}%
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <span className={cn(
                                  "text-lg font-bold",
                                  isSelected && !variantOutOfStock ? "text-[var(--gold)]" : 
                                  variantOutOfStock ? "text-[var(--foreground)]/50 line-through" : "text-[var(--foreground)]"
                                )}>
                                  {formatPrice(price)}
                                </span>
                                {hasDiscount && !variantOutOfStock && (
                                  <span className="text-sm text-[var(--foreground)]/50 line-through">
                                    {formatPrice(Number(product.compareAtPrice))}
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-3">
                                {/* Stock indicator with icon */}
                                <div className={cn(
                                  "flex items-center gap-1 text-xs font-medium",
                                  variantOutOfStock ? "text-red-400" : 
                                  variantLowStock ? "text-amber-400" : "text-emerald-400"
                                )}>
                                  {variantOutOfStock ? (
                                    <>
                                      <AlertCircle className="h-3 w-3" />
                                      <span>Agotado</span>
                                    </>
                                  ) : (
                                    <>
                                      <Package className="h-3 w-3" />
                                      <span>{v.stock} unid.</span>
                                    </>
                                  )}
                                </div>
                                
                                {/* ETA for restock if out of stock */}
                                {variantOutOfStock && (
                                  <div className="text-xs text-[var(--foreground)]/60">
                                    <span>📦 Reabasteciendo pronto</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* SKU reference */}
                            {v.sku && (
                              <p className="text-xs text-[var(--foreground)]/40 mt-2">
                                SKU: {v.sku}
                              </p>
                            )}
                          </div>
                          
                          {/* Visual indicator for selection */}
                          <div className={cn(
                            "w-5 h-5 rounded-full border-2 transition-all duration-200",
                            isSelected && !variantOutOfStock
                              ? "border-[var(--gold)] bg-[var(--gold)]"
                              : variantOutOfStock
                              ? "border-red-500/50"
                              : "border-white/40"
                          )}>
                            {isSelected && !variantOutOfStock && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-full h-full rounded-full bg-black flex items-center justify-center"
                              >
                                <div className="w-2 h-2 rounded-full bg-white" />
                              </motion.div>
                            )}
                          </div>
                        </div>
                        
                        {/* Hover effect overlay */}
                        {!variantOutOfStock && !isSelected && (
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[var(--gold)]/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                        )}
                        
                        {/* Out of stock overlay pattern */}
                        {variantOutOfStock && (
                          <div className="absolute inset-0 rounded-xl bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(239,68,68,0.1)_10px,rgba(239,68,68,0.1)_20px)] pointer-events-none" />
                        )}
                      </button>
                    </motion.div>
                  );
                })}
              </div>
              
              {/* Stock notification banner */}
              {isLowStock && !isOutOfStock && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30"
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0" />
                    <span className="text-sm text-amber-400">
                      <strong>¡Stock limitado!</strong> Solo quedan {availableStock} unidades de esta variante. ¡No te quedes sin ella!
                    </span>
                  </div>
                </motion.div>
              )}
              
              {/* Out of stock notification */}
              {isOutOfStock && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30"
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-sm text-red-400 font-medium">Esta variante está temporalmente agotada</span>
                      <p className="text-xs text-red-400/70 mt-1">
                        Estamos trabajando para reabastecer pronto. Prueba otra variante o contacta con nosotros para notificarte cuando esté disponible.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Selected variant summary */}
              {selectedVariant && !isOutOfStock && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 rounded-lg bg-[var(--gold)]/10 border border-[var(--gold)]/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[var(--gold)]" />
                      <span className="text-sm font-medium text-[var(--foreground)]">
                        Variante seleccionada: <span className="text-[var(--gold)]">{selectedVariant.name}</span>
                      </span>
                    </div>
                    <span className="text-sm font-bold text-[var(--gold)]">
                      {formatPrice(Number(selectedVariant.price))}
                    </span>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* Quantity */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-[var(--foreground)]/90">Cantidad</p>
              {selectedVariant && (
                <div className="flex items-center gap-2">
                  {isLowStock && !isOutOfStock && (
                    <span className="text-xs text-amber-400 font-medium">
                      ¡Solo {availableStock} disponibles!
                    </span>
                  )}
                  {availableStock > 10 && (
                    <span className="text-xs text-[var(--foreground)]/60">
                      Máx. {maxQuantity} por pedido
                    </span>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center rounded-lg border border-white/20 overflow-hidden">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1 || isOutOfStock}
                  className={cn(
                    "h-12 w-12 flex items-center justify-center transition-colors",
                    quantity <= 1 || isOutOfStock
                      ? "text-[var(--foreground)]/30 cursor-not-allowed"
                      : "text-[var(--foreground)]/80 hover:bg-[var(--elevated)]"
                  )}
                >
                  −
                </button>
                <span className={cn(
                  "h-12 w-14 flex items-center justify-center font-medium text-center",
                  isOutOfStock ? "text-[var(--foreground)]/50" : "text-[var(--foreground)]"
                )}>
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= maxQuantity || isOutOfStock}
                  className={cn(
                    "h-12 w-12 flex items-center justify-center transition-colors",
                    quantity >= maxQuantity || isOutOfStock
                      ? "text-[var(--foreground)]/30 cursor-not-allowed"
                      : "text-[var(--foreground)]/80 hover:bg-[var(--elevated)]"
                  )}
                >
                  +
                </button>
              </div>
              
              {/* Quick quantity buttons */}
              {!isOutOfStock && availableStock > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--foreground)]/60">Rápido:</span>
                  {[2, 3, 5].filter(q => q <= maxQuantity && q <= availableStock).map(q => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => handleQuantityChange(q)}
                      className={cn(
                        "px-3 py-1 text-xs font-medium rounded-md border transition-colors",
                        quantity === q
                          ? "border-[var(--gold)] bg-[var(--gold)]/20 text-[var(--gold)]"
                          : "border-white/20 text-[var(--foreground)]/70 hover:border-white/40 hover:bg-[var(--elevated)]"
                      )}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Stock error message */}
            {stockError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 flex items-center gap-2 text-sm text-red-400"
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{stockError}</span>
              </motion.div>
            )}
            
            {/* Stock progress bar */}
            {selectedVariant && !isOutOfStock && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-[var(--foreground)]/60 mb-1">
                  <span>Disponibilidad</span>
                  <span>{availableStock} de {availableStock + (10 - availableStock)} unidades</span>
                </div>
                <div className="w-full h-2 bg-[var(--elevated)] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(availableStock / 10) * 100}%` }}
                    transition={{ duration: 0.5 }}
                    className={cn(
                      "h-full rounded-full",
                      isLowStock ? "bg-amber-500" : "bg-emerald-500"
                    )}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4 mb-8">
            <div className="flex flex-col gap-2 w-full">
              <Button
                size="lg"
                className={cn(
                  "flex-1 min-w-[200px] rounded-xl py-6 transition-all duration-200",
                  isOutOfStock
                    ? "bg-gray-600 hover:bg-gray-600 cursor-not-allowed"
                    : isLowStock
                    ? "bg-amber-600 hover:bg-amber-700"
                    : ""
                )}
                onClick={handleAddToCart}
                disabled={adding || isOutOfStock || !selectedVariant}
              >
                {isOutOfStock ? (
                  <span className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Agotado
                  </span>
                ) : adding ? (
                  "Añadiendo…"
                ) : added ? (
                  <span className="flex items-center gap-2">
                    <Check className="h-5 w-5" />
                    Añadido al carrito
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Añadir al carrito
                  </span>
                )}
              </Button>
              
              {/* Success message */}
              {added && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-emerald-400 flex items-center gap-2"
                >
                  <Check className="h-4 w-4 shrink-0" />
                  <span>
                    {quantity} {quantity === 1 ? 'unidad' : 'unidades'} añadida{quantity > 1 ? 's' : ''} al carrito.{' '}
                    <Link href="/carrito" className="text-[var(--gold)] hover:underline font-medium">
                      Ver carrito
                    </Link>
                  </span>
                </motion.div>
              )}
              
              {/* General error message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-400 flex items-center gap-2"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>No se pudo añadir al carrito. Inténtalo de nuevo.</span>
                </motion.div>
              )}
              
              {/* Out of stock alternatives */}
              {isOutOfStock && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-[var(--foreground)]/70 bg-[var(--elevated)] p-3 rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-amber-400" />
                    <span className="font-medium text-amber-400">¿Quieres que te avisen?</span>
                  </div>
                  <p className="text-xs text-[var(--foreground)]/60">
                    Déjanos tu email y te notificaremos cuando esta variante esté disponible again.
                  </p>
                </motion.div>
              )}
            </div>
            
            {/* Action buttons */}
            <Button 
              size="icon" 
              variant="outline" 
              className="rounded-xl h-14 w-14 border-white/20 hover:border-white/40 hover:bg-[var(--elevated)]"
              disabled={isOutOfStock}
            >
              <Heart className="h-6 w-6" />
            </Button>
            <Button 
              size="icon" 
              variant="outline" 
              className="rounded-xl h-14 w-14 border-white/20 hover:border-white/40 hover:bg-[var(--elevated)]"
            >
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
