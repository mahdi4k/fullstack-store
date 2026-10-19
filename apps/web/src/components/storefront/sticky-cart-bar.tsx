"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { useI18n } from "@/components/providers/locale-provider";
import { formatToman, formatNumber } from "@/lib/format";

/**
 * Floating cart summary bar: total item count + payable Toman +
 * «تکمیل خرید» CTA. Rendered only when the cart has items.
 */
export function StickyCartBar() {
  const { dict, locale } = useI18n();
  const { totalItems, subtotal } = useCart();

  if (totalItems === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 px-4 pb-3">
      <Link
        href={`/${locale}/cart`}
        className="mx-auto flex max-w-md items-center justify-between rounded-2xl bg-emerald-600 px-4 py-3 text-white shadow-lg shadow-emerald-600/30"
      >
        <span className="flex items-center gap-2 text-xs font-medium">
          <span className="relative">
            <ShoppingCart className="h-5 w-5 rtl:-scale-x-100" />
          </span>
          <span className="font-bold">{formatNumber(totalItems, locale)}</span>
          <span>{formatToman(subtotal, locale)}</span>
        </span>
        <span className="rounded-xl bg-white/15 px-3 py-1.5 text-xs font-bold">
          {dict.store.cartBar.checkout}
        </span>
      </Link>
    </div>
  );
}
