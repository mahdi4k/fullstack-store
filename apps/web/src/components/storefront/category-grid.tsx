"use client";

import Link from "next/link";
import {
  LifeBuoy,
  Droplets,
  Zap,
  Cog,
  Sparkles,
  Bike,
  CircleDot,
  type LucideIcon,
} from "lucide-react";
import { useI18n } from "@/components/providers/locale-provider";
import type { StorefrontCategory } from "@/lib/types";

/** Lucide icons indexed by the `icon` name stored on Category rows. */
const ICONS: Record<string, LucideIcon> = {
  LifeBuoy,
  Droplets,
  Zap,
  Cog,
  Sparkles,
  Bike,
};

/** 3-column grid of categories with per-city product counts. */
export function CategoryGrid({
  citySlug,
  categories,
}: {
  citySlug: string;
  categories: StorefrontCategory[];
}) {
  const { locale } = useI18n();

  return (
    <ul className="grid grid-cols-3 gap-2">
      {categories.map((category) => {
        const Icon = ICONS[category.icon ?? ""] ?? CircleDot;
        return (
          <li key={category.id}>
            <Link
              href={`/${locale}/city/${citySlug}/category/${category.slug}`}
              className="flex flex-col items-center gap-2 rounded-2xl border border-zinc-200 bg-white p-3 text-center hover:border-emerald-400 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-emerald-600"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-[11px] font-semibold leading-4 text-zinc-800 dark:text-zinc-100">
                {category.name}
              </span>
              <span className="text-[10px] text-zinc-400">{category.productCount}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
