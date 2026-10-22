"use client";

import Link from "next/link";
import { useI18n } from "@/components/providers/locale-provider";
import type { Product } from "@/lib/types";
import { formatToman, formatPercent } from "@/lib/format";
import { Wrench } from "lucide-react";
import { BundleQty } from "./bundle-qty";
import { cn } from "@/lib/utils";

/**
 * Product/service-kit card: discount badge, strike-through list price,
 * Toman final price, the «تعویض» service tag and an Add button that
 * morphs to `[-] [count] [+]` quantity controls.
 */
export function BundleCard({
  product,
  citySlug,
  className,
}: {
  product: Product;
  citySlug: string;
  className?: string;
}) {
  const { dict, locale } = useI18n();

  const base = product.cityPrice ?? product.price;
  const discount = product.discountPercent ?? 0;
  const final = product.finalPrice ?? Math.round(base * (1 - discount / 100));
  const soldOut = (product.cityStock ?? product.stock) <= 0;

  return (
    <div
      className={cn(
        "flex w-full flex-col rounded-2xl border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900",
        className
      )}
    >
      {/* Photo, or gradient placeholder until supplier images arrive */}
      <Link
        href={`/${locale}/city/${citySlug}/product/${product.slug ?? product.id}`}
        className="relative mb-2 flex h-24 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50 to-zinc-100 dark:from-emerald-950/40 dark:to-zinc-800"
      >
        {discount > 0 ? (
          <span className="absolute top-2 start-2 z-10 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">
            {formatPercent(discount, locale)}
          </span>
        ) : null}
        {product.hasInstallationService ? (
          <span className="absolute top-2 end-2 z-10 inline-flex items-center gap-0.5 rounded-full bg-emerald-600/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
            <Wrench className="h-2.5 w-2.5" />
            تعویض
          </span>
        ) : null}
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="line-clamp-2 px-4 text-center text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
            {product.brand ?? ""}
          </span>
        )}
      </Link>

      <Link
        href={`/${locale}/city/${citySlug}/product/${product.slug ?? product.id}`}
        className="mb-1.5 line-clamp-2 min-h-8 text-xs font-semibold leading-5 text-zinc-800 hover:text-emerald-700 dark:text-zinc-100 dark:hover:text-emerald-400"
      >
        {product.name}
      </Link>

      {/* Price block */}
      <div className="mb-2">
        {discount > 0 ? (
          <span className="block text-[10px] text-zinc-400 line-through">
            {formatToman(base, locale)}
          </span>
        ) : null}
        <span className="block text-sm font-extrabold text-zinc-900 dark:text-zinc-50">
          {formatToman(final, locale)}
        </span>
      </div>

      {/* Add → [-][count][+] */}
      <div className="mt-auto">
        <BundleQty product={product} citySlug={citySlug} />
      </div>
    </div>
  );
}
