import { cookies } from "next/headers";
import { fetchCities } from "@/lib/storefront";
import { CITY_COOKIE, DEFAULT_CITY } from "@/lib/city";
import { StorefrontHeader } from "@/components/storefront/storefront-header";

/**
 * The marketplace-style header for the store sections (cart, login,
 * orders…), so everywhere the user goes the chrome matches the city
 * storefront. Falls back to the default city when no cookie exists.
 */
export async function StoreAppHeader() {
  const jar = await cookies();
  const slug = jar.get(CITY_COOKIE)?.value ?? DEFAULT_CITY;

  let cityName = slug;
  try {
    const cities = await fetchCities();
    cityName = cities.find((c) => c.slug === slug)?.name ?? slug;
  } catch {
    // Header still works with the raw slug if the API is unreachable.
  }

  return <StorefrontHeader citySlug={slug} cityName={cityName} />;
}
