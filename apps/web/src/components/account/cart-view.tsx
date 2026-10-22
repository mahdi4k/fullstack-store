"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ShoppingCart, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { errorMessage } from "@/lib/error";
import { formatToman } from "@/lib/format";
import { useCart } from "@/components/providers/cart-provider";
import { useI18n } from "@/components/providers/locale-provider";
import { plural } from "@/lib/i18n/dictionaries";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/feedback";
import type { Cart, CartItem } from "@/lib/types";
import { CartItemRow } from "./cart-item-row";

/**
 * Full cart management: quantity updates, removal, clear and a
 * subtotal summary with the checkout CTA.
 */
export function CartView() {
  const { apply, refresh } = useCart();
  const router = useRouter();
  const { locale, dict, lp } = useI18n();
  const [cart, setCart] = React.useState<Cart | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [busyItemId, setBusyItemId] = React.useState<number | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        setCart(await api<Cart>("/cart"));
      } catch (err) {
        setError(errorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const mutate = async (action: () => Promise<Cart>, itemId?: number) => {
    setBusyItemId(itemId ?? -1);
    setError(null);
    try {
      const updated = await action();
      setCart(updated);
      apply(updated);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusyItemId(null);
    }
  };

  const updateQuantity = (item: CartItem, quantity: number) =>
    mutate(() => api<Cart>(`/cart/items/${item.id}`, { method: "PATCH", body: { quantity } }), item.id);

  const removeItem = (item: CartItem) =>
    mutate(() => api<Cart>(`/cart/items/${item.id}`, { method: "DELETE" }), item.id);

  const clearCart = () => {
    setBusyItemId(-2);
    (async () => {
      try {
        await api<Cart>("/cart", { method: "DELETE" });
        setCart({ id: 0, userId: 0, items: [], totalItems: 0, subtotal: 0 });
        await refresh();
      } catch (err) {
        setError(errorMessage(err));
      } finally {
        setBusyItemId(null);
      }
    })();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  const items = cart?.items ?? [];

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <EmptyState
          icon={<ShoppingCart className="h-6 w-6" />}
          title={dict.cart.emptyTitle}
          description={dict.cart.emptyDescription}
        >
          <Button asChild>
            <Link href={lp("/products")}>{dict.cart.emptyCta}</Link>
          </Button>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          {dict.cart.title}
          <span className="ms-2 text-sm font-normal text-zinc-500">
            {plural(cart?.totalItems ?? 0, dict.cart.items, locale)}
          </span>
        </h1>
        <button
          type="button"
          onClick={clearCart}
          disabled={busyItemId === -2}
          className="text-sm text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400"
        >
          {dict.cart.clear}
          <Trash2 className="ms-1 inline h-3.5 w-3.5" />
        </button>
      </div>

      {error ? (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}

      <ul className="mt-6 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
        {items.map((item) => (
          <CartItemRow
            key={item.id}
            item={item}
            busy={busyItemId === item.id}
            onUpdateQuantity={(quantity) => updateQuantity(item, quantity)}
            onRemove={() => removeItem(item)}
          />
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{dict.cart.subtotal}</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {formatToman(cart?.subtotal ?? 0, locale)}
          </p>
        </div>
        <Button size="lg" className="gap-2" onClick={() => router.push(lp("/checkout"))}>
          {dict.cart.checkout} <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
        </Button>
      </div>
      <p className="mt-3 text-end text-xs text-zinc-400">
        {dict.cart.shippingNote}
      </p>
    </div>
  );
}
