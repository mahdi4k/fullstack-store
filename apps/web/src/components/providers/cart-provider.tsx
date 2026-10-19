"use client";

import * as React from "react";
import { api } from "@/lib/api";
import { useAuth } from "./auth-provider";
import type { Cart } from "@/lib/types";

interface CartContextValue {
  /** Total quantity of items in the cart (for the navbar badge). */
  totalItems: number;
  subtotal: number;
  /** Re-fetch the cart from the API. */
  refresh: () => Promise<void>;
  /** Apply a server-returned cart (adds/update/remove responses). */
  apply: (cart: Cart) => void;
  clearLocal: () => void;
}

const CartContext = React.createContext<CartContextValue | null>(null);

/**
 * Keeps the visible cart count in sync across the app.
 * Requires `AuthProvider` above it in the tree.
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = React.useState<Cart | null>(null);

  React.useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const fresh = await api<Cart>("/cart");
        if (!cancelled) setCart(fresh);
      } catch {
        // Cart is non-critical navigation state; ignore errors silently.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const value: CartContextValue = {
    totalItems: user ? (cart?.totalItems ?? 0) : 0,
    subtotal: cart?.subtotal ?? 0,
    refresh: async () => {
      try {
        setCart(await api<Cart>("/cart"));
      } catch {
        // ignore
      }
    },
    apply: setCart,
    clearLocal: () => setCart(null),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/** Access cart navigation state. Throws if used outside `CartProvider`. */
export function useCart(): CartContextValue {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
