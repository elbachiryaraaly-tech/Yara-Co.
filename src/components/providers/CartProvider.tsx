"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export type CartItem = {
  id: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  name: string;
  slug: string;
  price: number;
  image: string | null;
};

type CartContextValue = {
  items: CartItem[];
  isLoading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number, variantId?: string | null) => Promise<boolean>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      const data = await res.json();
      setItems(data.items ?? []);
    } catch {
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = useCallback(
    async (productId: string, quantity = 1, variantId?: string | null): Promise<boolean> => {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, variantId, quantity }),
      });
      if (!res.ok) return false;
      await refreshCart();
      return true;
    },
    [refreshCart]
  );

  const removeFromCart = useCallback(
    async (itemId: string) => {
      const res = await fetch(`/api/cart/${itemId}`, { method: "DELETE" });
      if (!res.ok) return;
      await refreshCart();
    },
    [refreshCart]
  );

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      if (!res.ok) return;
      await refreshCart();
    },
    [refreshCart]
  );

  const value: CartContextValue = {
    items,
    isLoading,
    refreshCart,
    addToCart,
    removeFromCart,
    updateQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
