"use client";

import Link from "next/link";
import { Wrench } from "lucide-react";
import { useI18n } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";

const CATEGORY_PILLS: readonly { key: "spareParts" | "brakeSystem" | "battery"; slug: string; search?: string }[] = [
  { key: "spareParts", slug: "spare-parts" },
  { key: "brakeSystem", slug: "spare-parts", search: "لنت" },
  { key: "battery", slug: "car-electrical", search: "باتری" },
];

/**
 * Sticky quick-filter pill row: پیشنهادات ویژه (special offers = discounted
 * service kits), then category shortcuts.
 */
export function QuickFilterPills({ citySlug }: { citySlug: string }) {
  const { dict, locale } = useI18n();

  return (
    <div className="sticky top-14 z-20 -mx-4 border-b border-zinc-100 bg-white px-4 py-2 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Link
          href={`/${locale}/city/${citySlug}/category/offers`}
          className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-red-600 px-3 py-1.5 text-xs font-bold text-white"
        >
          🔥 {dict.store.sections.specialOffers}
        </Link>
        {CATEGORY_PILLS.map(({ key, slug, search }) => (
          <Link
            key={key}
            href={`/${locale}/city/${citySlug}/category/${slug}${search ? `?q=${encodeURIComponent(search)}` : ""}`}
            className="inline-flex flex-shrink-0 items-center gap-1 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:border-emerald-500 hover:text-emerald-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          >
            <Wrench className="h-3 w-3" />
            {dict.store.sections[key]}
          </Link>
        ))}
      </div>
    </div>
  );
}
