"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus, Minus } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/components/providers/auth-provider";
import { useCart } from "@/components/providers/cart-provider";
import { useI18n } from "@/components/providers/locale-provider";
import type { Cart, Product } from "@/lib/types";
import { cn } from "@/lib/utils";

type AddResponse = { message: string; cart: Cart };

/**
 * Add button that morphs into `[-] [count] [+]` once the item is in the
 * cart. Cart requires login → guests are sent to `/[locale]/login?next=…`.
 */
export function BundleQty({
  product,
  citySlug,
  compact = false,
}: {
  product: Product;
  citySlug: string;
  compact?: boolean;
}) {
  const { dict, locale } = useI18n();
  const { user } = useAuth();
  const { apply } = useCart();
  const router = useRouter();
  const [localCount, setLocalCount] = React.useState(0);

  const add = useMutation({
    mutationFn: (quantity: number) =>
      api<AddResponse>("/cart/items", {
        method: "POST",
        body: { productId: product.id, quantity },
      }),
    onSuccess: (res) => {
      apply(res.cart);
      setLocalCount((c) => c + 1);
      toast.success(dict.store.product.added);
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 401) {
        // Server cart requires an account.
        toast.error(dict.store.review.loginRequired);
        router.push(
          `/${locale}/login?next=/${locale}/city/${citySlug}/product/${product.slug ?? product.id}`
        );
        return;
      }
      toast.error(error.message ?? "Error");
    },
  });
  const soldOut = (product.cityStock ?? product.stock) <= 0;

  if (soldOut) {
    return (
      <div
        className={cn(
          "flex h-8 items-center justify-center rounded-lg bg-zinc-100 text-xs font-medium text-zinc-400 dark:bg-zinc-800"
        )}
      >
        {dict.store.product.outOfStock}
      </div>
    );
  }

  // Morph to quantity controls after an add in this session.
  if (localCount > 0) {
    return (
      <div className="flex h-8 items-center justify-between rounded-lg bg-emerald-600 px-1 text-white">
        <button
          aria-label="+"
          onClick={() => add.mutate(1)}
          disabled={add.isPending}
          className="rounded-md p-1.5 hover:bg-white/20 disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
        <span className="text-sm font-bold">{localCount}</span>
        <button
          aria-label="-"
          onClick={() => setLocalCount((c) => c - 1)}
          className="rounded-md p-1.5 hover:bg-white/20"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => add.mutate(1)}
      disabled={add.isPending}
      className={cn(
        "flex h-8 w-full items-center justify-center gap-1 rounded-lg bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60",
        compact && "h-7 w-auto px-3"
      )}
    >
      <Plus className={cn("h-3.5 w-3.5", compact && "hidden")} />
      {compact ? dict.store.product.addToCart : dict.store.product.addToCart}
    </button>
  );
}
