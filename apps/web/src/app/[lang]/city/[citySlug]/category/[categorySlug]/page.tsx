import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchCities, fetchCityProducts } from "@/lib/storefront";
import { fetchCategories } from "@/lib/queries";
import { StorefrontHeader } from "@/components/storefront/storefront-header";
import { FilterDrawer } from "@/components/storefront/filter-drawer";
import { BundleCard } from "@/components/storefront/bundle-card";
import { QuickFilterPills } from "@/components/storefront/quick-filter-pills";
import { SearchBar } from "@/components/storefront/search-bar";
import { StickyCartBar } from "@/components/storefront/sticky-cart-bar";
import { hasLocale, getDictionary } from "@/lib/i18n/dictionaries";
import type { Product } from "@/lib/types";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata(): Promise<Metadata> {
  return { title: "دسته‌بندی محصولات" };
}

interface PageProps {
  params: Promise<{ lang: string; citySlug: string; categorySlug: string }>;
  searchParams: SearchParams;
}

/**
 * Category / search / offers listing for one city
 * (`/[lang]/city/[citySlug]/category/[categorySlug]?q=&brand=&vehicle=&sort=`).
 * Pseudo slugs: `search` (text query), `offers` (best discounts).
 */
export default function CategoryPage({ params, searchParams }: PageProps) {
  return (
    <Suspense fallback={<ListSkeleton />}>
      <CategoryContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function CategoryContent({ params, searchParams }: PageProps) {
  const { lang, citySlug, categorySlug } = await params;
  if (!hasLocale(lang)) notFound();
  const sp = await searchParams;
  const asString = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : (value ?? "");

  const dict = getDictionary(lang);
  const q = asString(sp.q);
  const brand = asString(sp.brand);
  const vehicle = asString(sp.vehicle);
  const sort = asString(sp.sort);

  const all = await fetchCities();
  const city = all.find((c) => c.slug === citySlug);
  if (!city) notFound();

  // Section title: real category name, or the pseudo-category label.
  let title = categorySlug;
  if (categorySlug === "offers") title = dict.store.sections.specialOffers;
  else if (categorySlug === "search") title = dict.store.header.searchPlaceholder;
  else {
    const categories = await fetchCategories();
    title = categories.find((c) => c.slug === categorySlug)?.name ?? categorySlug;
  }

  const query: Record<string, unknown> = { city: citySlug, limit: 30 };
  if (categorySlug === "search") {
    if (q) query.search = q;
  } else if (categorySlug !== "offers") {
    query.category = categorySlug;
  }
  if (brand) query.brand = brand;
  if (vehicle) query.vehicle = vehicle;

  const { data } = await fetchCityProducts(query);

  let products: Product[] = data;
  if (categorySlug === "offers") {
    products = products
      .filter((p) => (p.discountPercent ?? 0) > 0)
      .sort((a, b) => (b.discountPercent ?? 0) - (a.discountPercent ?? 0));
  }
  if (sort === "price-asc") {
    products = products.sort((a, b) => (a.finalPrice ?? a.price) - (b.finalPrice ?? b.price));
  } else if (sort === "price-desc") {
    products = products.sort((a, b) => (b.finalPrice ?? b.price) - (a.finalPrice ?? a.price));
  } else if (sort === "discount") {
    products = products.sort((a, b) => (b.discountPercent ?? 0) - (a.discountPercent ?? 0));
  }

  // Facet values for the filter drawers.
  const brands = [...new Set(data.map((p) => p.brand).filter(Boolean))] as string[];
  const vehicles = [...new Set(data.flatMap((p) => p.compatibleVehicles ?? []))];

  return (
    <div
      dir={lang === "fa" ? "rtl" : "ltr"}
      lang={lang}
      className="mx-auto min-h-dvh max-w-md bg-white px-4 pb-32 dark:bg-zinc-950 md:max-w-xl"
    >
      <StorefrontHeader citySlug={citySlug} cityName={city.name} />

      {/* Search field only on the search pseudo-category */}
      {categorySlug === "search" ? (
        <div className="pt-3">
          <SearchBar citySlug={citySlug} initialQuery={q} />
        </div>
      ) : null}

      <div className="space-y-3 pt-3">
        <QuickFilterPills citySlug={citySlug} />

        <div className="flex items-center justify-between gap-2">
          <h1 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-50">
            {title}
          </h1>
          <FilterDrawer
            citySlug={citySlug}
            categorySlug={categorySlug}
            brands={brands}
            vehicles={vehicles}
          />
        </div>

        {products.length === 0 ? (
          <p className="py-16 text-center text-sm text-zinc-400">
            {dict.store.listing.empty}
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-3">
            {products.map((product) => (
              <li key={product.id}>
                <BundleCard product={product} citySlug={citySlug} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <StickyCartBar />
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="mx-auto min-h-dvh max-w-md bg-white px-4 pb-32 dark:bg-zinc-950 md:max-w-xl">
      <div className="flex h-14 items-center justify-between">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-5 w-16" />
      </div>
      <div className="grid grid-cols-2 gap-3 pt-4">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-56 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
