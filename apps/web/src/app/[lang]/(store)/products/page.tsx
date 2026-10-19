import { Suspense } from "react";
import type { Metadata } from "next";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiErrorCard } from "@/components/ui/api-error-card";
import { ProductFilters, type CatalogQuery } from "@/components/store/product-filters";
import { fetchCategories } from "@/lib/queries";
import { ProductsContent } from "./products-content";
import { serverLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionaries";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/products">): Promise<Metadata> {
  const [{ lang }] = await Promise.all([params]);
  const dict = getDictionary(lang as never);
  return { title: dict.catalog.title };
}

export default function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <ProductHeader />
      <div className="mt-6">
        <Suspense fallback={<Skeleton className="h-[52px] w-full rounded-xl" />}>
          <FiltersParams searchParams={searchParams} />
        </Suspense>
      </div>

      <div className="mt-6">
        <Suspense fallback={<GridSkeleton />}>
          <CatalogParams searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

async function ProductHeader() {
  const dict = getDictionary(await serverLocale());
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">{dict.catalog.title}</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        {dict.catalog.subtitle}
      </p>
    </>
  );
}

/** Filters bar awaits the URL params, then fetches its own categories. */
async function FiltersParams({ searchParams }: { searchParams: SearchParams }) {
  const query = await parseQuery(searchParams);
  let categories;
  let failure: Error | null = null;
  try {
    categories = await fetchCategories();
  } catch (error) {
    failure = error as Error;
  }
  if (failure || !categories) {
    return <ApiErrorCard error={failure ?? new Error("Unknown error")} />;
  }
  return <ProductFilters categories={categories} query={query} />;
}

/** Page body: products list + pagination, driven entirely by the URL query. */
async function CatalogParams({ searchParams }: { searchParams: SearchParams }) {
  const query = await parseQuery(searchParams);
  return <ProductsContent query={query} />;
}

async function parseQuery(searchParams: SearchParams): Promise<CatalogQuery> {
  const params = await searchParams;
  const pick = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
  };
  return {
    search: pick("search"),
    categoryId: pick("categoryId"),
    minPrice: pick("minPrice"),
    maxPrice: pick("maxPrice"),
    inStock: pick("inStock") === "true" ? "true" : "",
    sortBy: pick("sortBy") || "createdAt",
    sortOrder: pick("sortOrder") || "desc",
    page: pick("page"),
  };
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }, (_, index) => (
        <Skeleton key={index} className="h-72 rounded-xl" />
      ))}
    </div>
  );
}
