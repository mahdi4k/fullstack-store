"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useI18n } from "@/components/providers/locale-provider";
import type { Product } from "@/lib/types";
import { BundleCard } from "./bundle-card";

interface ProductRailProps {
  title: string;
  citySlug: string;
  products: Product[];
  /** Optional "view all" link target. */
  viewAllHref?: string;
}

/** Horizontal scroll rail of bundle cards with a section header. */
export function ProductRail({
  title,
  citySlug,
  products,
  viewAllHref,
}: ProductRailProps) {
  const { locale } = useI18n();
  if (products.length === 0) return null;
  const Arrow = locale === "fa" ? ArrowLeft : ArrowRight;

  return (
    <section>
      <div className="mb-3 flex items-end justify-between">
        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">{title}</h2>
        {viewAllHref ? (
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:underline dark:text-emerald-400"
          >
            <Arrow className="h-3.5 w-3.5" />
          </Link>
        ) : null}
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {products.map((product) => (
          <BundleCard
            key={product.id}
            product={product}
            citySlug={citySlug}
            className="w-40 flex-shrink-0"
          />
        ))}
      </div>
    </section>
  );
}
