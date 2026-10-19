"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { useI18n } from "@/components/providers/locale-provider";
import { BottomSheet } from "./bottom-sheet";
import { cn } from "@/lib/utils";

interface FilterDrawerProps {
  citySlug: string;
  categorySlug: string;
  /** Brand values present in the current result set. */
  brands: string[];
  /** Vehicle values present in the current result set. */
  vehicles: string[];
}

const SORT_OPTIONS = ["discount", "price-asc", "price-desc", "createdAt"] as const;

/**
 * Bottom-sheet filters (برند / خودروی من / مرتب‌سازی). Selection is kept
 * in the URL (`?brand=&vehicle=&sort=`) so the server page can filter.
 */
export function FilterDrawer({
  citySlug,
  categorySlug,
  brands,
  vehicles,
}: FilterDrawerProps) {
  const { dict, locale } = useI18n();
  const router = useRouter();
  const params = useSearchParams();
  const [open, setOpen] = React.useState(false);

  const currentBrand = params.get("brand") ?? "";
  const currentVehicle = params.get("vehicle") ?? "";
  const currentSort = params.get("sort") ?? "";

  function apply(nextBrand: string, nextVehicle: string, nextSort: string) {
    const search = new URLSearchParams();
    const q = params.get("q");
    if (q) search.set("q", q);
    if (nextBrand) search.set("brand", nextBrand);
    if (nextVehicle) search.set("vehicle", nextVehicle);
    if (nextSort) search.set("sort", nextSort);
    const query = search.toString();
    router.push(
      `/${locale}/city/${citySlug}/category/${categorySlug}${query ? `?${query}` : ""}`
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        {dict.store.listing.brand} · {dict.store.listing.vehicle}
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title={`${dict.store.listing.brand} / ${dict.store.listing.vehicle}`}>
        {/* Brand chips */}
        <p className="mb-2 text-xs font-bold text-zinc-500">{dict.store.listing.brand}</p>
        <div className="mb-4 flex flex-wrap gap-1.5">
          {brands.map((brand) => (
            <button
              key={brand}
              onClick={() => apply(brand === currentBrand ? "" : brand, currentVehicle, currentSort)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium",
                brand === currentBrand
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                  : "border-zinc-200 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"
              )}
            >
              {brand}
            </button>
          ))}
        </div>

        {/* Vehicle chips */}
        <p className="mb-2 text-xs font-bold text-zinc-500">{dict.store.listing.vehicle}</p>
        <div className="mb-4 flex flex-wrap gap-1.5">
          {vehicles.map((vehicle) => (
            <button
              key={vehicle}
              onClick={() => apply(currentBrand, vehicle === currentVehicle ? "" : vehicle, currentSort)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium",
                vehicle === currentVehicle
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                  : "border-zinc-200 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"
              )}
            >
              {vehicle}
            </button>
          ))}
        </div>

        {/* Sort */}
        <p className="mb-2 text-xs font-bold text-zinc-500">{dict.store.listing.sort}</p>
        <div className="mb-5 flex flex-wrap gap-1.5">
          {SORT_OPTIONS.map((sort) => (
            <button
              key={sort}
              onClick={() => apply(currentBrand, currentVehicle, sort === currentSort ? "" : sort)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium",
                sort === currentSort
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                  : "border-zinc-200 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"
              )}
            >
              {sort}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            apply("", "", "");
            setOpen(false);
          }}
          className="h-10 w-full rounded-xl border border-zinc-200 text-xs font-bold text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"
        >
          {dict.store.listing.reset}
        </button>
      </BottomSheet>
    </>
  );
}
