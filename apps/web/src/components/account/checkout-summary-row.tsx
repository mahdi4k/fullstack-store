"use client";

import { formatToman } from "@/lib/format";
import { useI18n } from "@/components/providers/locale-provider";
import { ProductImage } from "@/components/store/product-image";

/** One product line in the checkout summary. */
export interface CheckoutItemSummary {
  productId: number;
  quantity: number;
  name: string;
  price: number;
  imageUrl?: string | null;
}

export function SummaryRow({ item }: { item: CheckoutItemSummary }) {
  const { locale } = useI18n();
  return (
    <li className="flex items-center gap-3 p-3.5">
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-zinc-50 dark:bg-zinc-950">
        <ProductImage
          src={item.imageUrl}
          alt={item.name}
          className="h-full w-full"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {item.name}
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">× {item.quantity}</p>
      </div>
      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        {formatToman(item.price * item.quantity, locale)}
      </p>
    </li>
  );
}
