import { ApiErrorCard } from "@/components/ui/api-error-card";
import { PageNavigation } from "@/components/store/page-navigation";
import { ProductGrid } from "@/components/store/product-grid";
import { fetchProducts } from "@/lib/queries";
import type { Product, ProductQuery } from "@/lib/types";
import type { CatalogQuery } from "@/components/store/product-filters";
import { serverLocale } from "@/lib/i18n/server";
import { getDictionary, plural } from "@/lib/i18n/dictionaries";
import { localePath } from "@/lib/i18n/config";

export const PAGE_SIZE = 12;

/** Products list + pagination for the catalog page, driven by the URL query. */
export async function ProductsContent({ query }: { query: CatalogQuery }) {
  const locale = await serverLocale();
  const dict = getDictionary(locale);

  let result: {
    data: Product[];
    meta: { page: number; totalPages: number; total: number };
  };

  const apiQuery: ProductQuery = {
    page: Number(query.page) || 1,
    limit: PAGE_SIZE,
    search: query.search || undefined,
    categoryId: query.categoryId ? Number(query.categoryId) : undefined,
    minPrice: query.minPrice ? Number(query.minPrice) : undefined,
    maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,
    inStock: query.inStock === "true" || undefined,
    sortBy: query.sortBy as ProductQuery["sortBy"],
    sortOrder: query.sortOrder as ProductQuery["sortOrder"],
  };

  try {
    result = await fetchProducts(apiQuery);
  } catch (error) {
    return <ApiErrorCard error={error as Error} />;
  }

  return (
    <>
      <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
        {plural(result.meta.total, dict.catalog.results, locale)}
      </p>
      <ProductGrid products={result.data} />
      <PageNavigation
        basePath={localePath(locale, "/products")}
        page={result.meta.page}
        totalPages={result.meta.totalPages}
        ariaLabel={dict.catalog.paginationAria}
        prevLabel={dict.catalog.previous}
        nextLabel={dict.catalog.next}
        query={query as unknown as Record<string, string>}
      />
    </>
  );
}
