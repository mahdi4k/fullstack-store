/** Cookie that remembers the visitor's chosen city. */
export const CITY_COOKIE = "city";

/** City used when nothing is chosen yet (Isfahan — user's home city). */
export const DEFAULT_CITY = "isfahan";

/**
 * Cities offered first while `GET /cities` loads; the full list replaces
 * this fallback as soon as the API responds.
 */
export const FALLBACK_CITIES = [
  { slug: "isfahan", name: "اصفهان" },
  { slug: "tehran", name: "تهران" },
  { slug: "karaj", name: "کرج" },
  { slug: "mashhad", name: "مشهد" },
  { slug: "shiraz", name: "شیراز" },
  { slug: "tabriz", name: "تبریز" },
] as const;
