/** Supported locales. Persian is the default/main language. */
export const FA = "fa" as const;
export const EN = "en" as const;

export type Locale = typeof FA | typeof EN;

export const LOCALES: readonly Locale[] = [FA, EN];

/** Persian is the main locale — root `/` always redirects here. */
export const DEFAULT_LOCALE: Locale = FA;

export const LOCALE_COOKIE = "NEXT_LOCALE";

/** RTL languages of this app (Persian); English stays LTR. */
const RTL_LOCALES: readonly Locale[] = [FA];

export function isLocale(value: string | undefined | null): value is Locale {
  return LOCALES.some((locale) => locale === value);
}

export function dirOf(locale: Locale): "rtl" | "ltr" {
  return RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
}

/** Prefix an internal path with the locale: `localePath("fa", "/products")` → `/fa/products`. */
export function localePath(locale: Locale, path: string): string {
  if (path.startsWith("//")) return path; // never touch protocol-relative URLs
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(path)) return path; // absolute URLs pass through
  // Already prefixed (e.g. `?next=/fa/...` read back from a link) — don't double it.
  if (path === `/${locale}` || path.startsWith(`/${locale}/`)) return path;
  return `/${locale}${path === "/" ? "" : path}`;
}

export function otherLocale(locale: Locale): Locale {
  return locale === FA ? EN : FA;
}
