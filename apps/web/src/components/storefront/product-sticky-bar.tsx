"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ShoppingBasket } from "lucide-react";
import { useI18n } from "@/components/providers/locale-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { useCart } from "@/components/providers/cart-provider";
import { api, ApiError } from "@/lib/api";
import toast from "react-hot-toast";
import { formatToman, formatPercent } from "@/lib/format";
import type { Cart } from "@/lib/types";

interface ProductStickyBarProps {
  productId: number;
  productSlug: string;
  citySlug: string;
  /** List price (city-adjusted, pre-discount). */
  base: number;
  final: number;
  discount: number;
  soldOut: boolean;
}

/**
 * Sticky bottom bar: discount badge + final Toman price + add-to-cart.
 * Guests are routed to login (`?next=`) since the cart is server-backed.
 */
export function ProductStickyBar({
  productId,
  productSlug,
  citySlug,
  base,
  final,
  discount,
  soldOut,
}: ProductStickyBarProps) {
  const { dict, locale } = useI18n();
  const router = useRouter();
  const { user } = useAuth();
  const { apply } = useCart();
  const [pending, setPending] = React.useState(false);

  async function addToCart() {
    if (!user) {
      router.push(
        `/${locale}/login?next=/${locale}/city/${citySlug}/product/${productSlug}`
      );
      return;
    }
    setPending(true);
    try {
      const res = await api<{ cart: Cart }>("/cart/items", {
        method: "POST",
        body: { productId, quantity: 1 },
      });
      apply(res.cart);
      toast.success(dict.store.product.added);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        router.push(
          `/${locale}/login?next=/${locale}/city/${citySlug}/product/${productSlug}`
        );
        return;
      }
      toast.error(error instanceof Error ? error.message : "Error");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 px-4 pb-3">
      <div className="mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white p-3 shadow-xl dark:border-zinc-700 dark:bg-zinc-900 md:max-w-xl">
        {/* Price block */}
        <div className="min-w-0">
          {discount > 0 ? (
            <span className="flex items-center gap-1.5">
              <span className="rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {formatPercent(discount, locale)}
              </span>
              <span className="text-[11px] text-zinc-400 line-through">
                {formatToman(base, locale)}
              </span>
            </span>
          ) : null}
          <span className="block text-sm font-extrabold text-zinc-900 dark:text-zinc-50">
            {formatToman(final, locale)}
          </span>
        </div>

        {/* CTA */}
        {soldOut ? (
          <span className="rounded-xl bg-zinc-100 px-4 py-2.5 text-xs font-bold text-zinc-400 dark:bg-zinc-800">
            {dict.store.product.outOfStock}
          </span>
        ) : (
          <button
            onClick={addToCart}
            disabled={pending}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            <ShoppingBasket className="h-4 w-4" />
            {dict.store.product.addToCart}
          </button>
        )}
      </div>
    </div>
  );
}
