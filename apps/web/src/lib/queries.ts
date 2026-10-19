import { apiUrl } from "./config";
import { qs } from "./api";
import type {
  Category,
  Paginated,
  Product,
  ProductDetail,
  ProductQuery,
} from "./types";

/**
 * Server-side data fetching for public catalog endpoints.
 * Results are uncached so pages always show fresh data, and are
 * streamed inside `<Suspense>` by the pages that use them.
 */
async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(apiUrl(path), {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `API ${res.status}: ${detail || path}`
    );
  }
  return (await res.json()) as T;
}

export function fetchProducts(query: ProductQuery) {
  return getJson<Paginated<Product>>(`/products${qs(query)}`);
}

export function fetchProduct(id: number) {
  return getJson<ProductDetail>(`/products/${id}`);
}

export function fetchCategories() {
  return getJson<Category[]>("/categories");
}

export function fetchCategory(id: number) {
  return getJson<Category>(`/categories/${id}`);
}

/** `GET /products/by-slug/:slug?city=…` — product page by URL slug. */
export function getProductBySlug(slug: string, city?: string) {
  return getJson<ProductDetail>(`/products/by-slug/${slug}${qs({ city })}`);
}
