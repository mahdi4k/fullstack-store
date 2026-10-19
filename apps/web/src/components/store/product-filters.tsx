"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Search } from "lucide-react";
import { useI18n } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { Category } from "@/lib/types";
import { InStockToggle } from "./in-stock-toggle";

export interface CatalogQuery {
  search: string;
  categoryId: string;
  minPrice: string;
  maxPrice: string;
  /** "" | "true" — kept as string so it round-trips through the URL cleanly. */
  inStock: string;
  sortBy: string;
  sortOrder: string;
  page: string;
}

/**
 * Catalog toolbar: keyword search, category/price/stock filters and sorting.
 * Fully URL-driven — every change re-navigates to the catalog page so the
 * server components fetch fresh data and results stay shareable.
 */
export function ProductFilters({
  categories,
  query,
}: {
  categories: Category[];
  query: CatalogQuery;
}) {
  const { dict, lp } = useI18n();
  const router = useRouter();
  // Local draft state for text inputs, re-derived from the URL when it changes.
  const [draft, setDraft] = React.useState({
    search: query.search,
    minPrice: query.minPrice,
    maxPrice: query.maxPrice,
  });

  // Render-phase adjustment: when the URL changed (navbar search, reset…)
  // snap the draft back in sync instead of using effects.
  if (
    draft.search !== query.search ||
    draft.minPrice !== query.minPrice ||
    draft.maxPrice !== query.maxPrice
  ) {
    setDraft({
      search: query.search,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
    });
  }

  const setSearch = (search: string) => setDraft((prev) => ({ ...prev, search }));
  const setMinPrice = (minPrice: string) => setDraft((prev) => ({ ...prev, minPrice }));
  const setMaxPrice = (maxPrice: string) => setDraft((prev) => ({ ...prev, maxPrice }));

  const navigate = (partial: Partial<CatalogQuery>) => {
    const next: Record<string, string> = { ...query, ...partial } as Record<string, string>;
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(next)) {
      if (key !== "page" && value) params.set(key, value);
    }
    const qs = params.toString();
    router.push(qs ? `${lp("/products")}?${qs}` : lp("/products"));
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    navigate({
      search: draft.search.trim(),
      minPrice: draft.minPrice,
      maxPrice: draft.maxPrice,
      page: "",
    });
  };

  const hasAnyFilter =
    query.search || query.categoryId || query.minPrice || query.maxPrice ||
    query.inStock || query.sortBy !== "createdAt" || query.sortOrder !== "desc";

  const t = dict.catalog;

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 md:flex-row md:items-center md:flex-wrap"
    >
      {/* keyword */}
      <div className="relative flex-1 basis-56">
        <Search className="pointer-events-none absolute start-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
        <Input
          value={draft.search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="ps-8"
          aria-label={t.searchAria}
        />
      </div>

      {/* price range */}
      <div className="flex items-center gap-1.5">
        <Input
          type="number"
          min={0}
          step="0.01"
          value={draft.minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          placeholder={t.minPricePlaceholder}
          className="w-24"
          aria-label={t.minPriceAria}
        />
        <span className="text-zinc-400">–</span>
        <Input
          type="number"
          min={0}
          step="0.01"
          value={draft.maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          placeholder={t.maxPricePlaceholder}
          className="w-24"
          aria-label={t.maxPriceAria}
        />
      </div>

      {/* category */}
      <Select
        value={query.categoryId}
        onChange={(e) => navigate({ categoryId: e.target.value, page: "" })}
        className="w-40"
        aria-label={t.categoriesAria}
      >
        <option value="">{t.allCategories}</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </Select>

      {/* stock */}
      <InStockToggle
        checked={query.inStock === "true"}
        onChange={(checked) => navigate({ inStock: checked ? "true" : "", page: "" })}
      />
      {/* sorting */}
      <Select
        value={`${query.sortBy}:${query.sortOrder}`}
        onChange={(e) => {
          const [sortBy = "createdAt", sortOrder = "desc"] = e.target.value.split(":");
          navigate({ sortBy, sortOrder, page: "" });
        }}
        className="w-44"
        aria-label={t.sortAria}
      >
        <option value="createdAt:desc">{t.sortNewest}</option>
        <option value="createdAt:asc">{t.sortOldest}</option>
        <option value="price:asc">{t.sortPriceLow}</option>
        <option value="price:desc">{t.sortPriceHigh}</option>
        <option value="name:asc">{t.sortNameAsc}</option>
        <option value="name:desc">{t.sortNameDesc}</option>
      </Select>

      {/* actions */}
      <div className="flex gap-2">
        <Button type="submit" size="sm">{t.apply}</Button>
        {hasAnyFilter ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => router.push(lp("/products"))}
          >
            <RotateCcw className="h-3.5 w-3.5" /> {t.reset}
          </Button>
        ) : null}
      </div>
    </form>
  );
}
