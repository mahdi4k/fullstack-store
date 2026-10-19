import { api, qs } from "./api";
import type { City, Product, ProductQuery, StorefrontResponse } from "./types";

/**
 * Fetchers for the city-scoped automotive marketplace endpoints.
 * Works on both the server (RSC) and the client (TanStack Query).
 */

/** `GET /cities` — list of active cities for the city sheet. */
export function fetchCities() {
  return api<City[]>("/cities");
}

/** `GET /storefront/:citySlug` — banners, categories, bundles, vendors. */
export function fetchStorefront(citySlug: string) {
  return api<StorefrontResponse>(`/storefront/${citySlug}`);
}

/** `GET /products?city=…&category=…` — city-priced listing. */
export function fetchCityProducts(query: ProductQuery) {
  return api<{ data: Product[] } & Record<string, unknown>>(
    `/products${qs(query)}`,
  );
}
