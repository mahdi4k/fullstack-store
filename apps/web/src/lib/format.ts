import type { Locale } from "./i18n/config";

/* ---------------------------------------------------------------------------
 * Classic store formatters (USD prices — used by the pre-marketplace pages)
 * ------------------------------------------------------------------------ */

/** Currency (USD) formatting: `$1,234.00`, localized digits/direction. */
export function formatMoney(value: number, locale: Locale = "fa"): string {
  return new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

/** Date-only formatting for orders, reviews and profiles. */
export function formatDate(value: string | number | Date, locale: Locale = "fa"): string {
  return new Intl.DateTimeFormat(locale === "fa" ? "fa-IR" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

/** Date + time formatting for order lists and admin tables. */
export function formatDateTime(
  value: string | number | Date,
  locale: Locale = "fa"
): string {
  return new Intl.DateTimeFormat(locale === "fa" ? "fa-IR" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

/** Human stock line for the product page: `{ inStock, text }`. */
export function stockInfo(
  stock: number,
  dict: {
    stockOut: string;
    stockCardIn: string;
    stockOnlyLeft: string;
    stockIn: string;
  },
  locale: Locale = "fa"
): { inStock: boolean; text: string } {
  if (stock <= 0) return { inStock: false, text: dict.stockOut };
  if (stock <= 5)
    return {
      inStock: true,
      text: stockOnlyLeftText(dict.stockOnlyLeft, stock, locale),
    };
  return { inStock: true, text: fillNumber(dict.stockIn, stock, locale) };
}

/** `{n} left` warns when few units remain. */
function stockOnlyLeftText(template: string, stock: number, locale: Locale): string {
  return fillNumber(template, stock, locale);
}

function fillNumber(template: string, value: number, locale: Locale): string {
  return template.replaceAll(
    "{n}",
    value.toLocaleString(locale === "fa" ? "fa-IR" : "en-US")
  );
}

/* ---------------------------- Status badge styles ------------------------- */

/** Tailwind classes for order status badges. */
export const ORDER_STATUS_STYLES: Record<string, string> = {
  PENDING:
    "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-900",
  PROCESSING:
    "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/40 dark:text-sky-300 dark:border-sky-900",
  SHIPPED:
    "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-900",
  DELIVERED:
    "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-900",
  CANCELLED:
    "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-900",
};

/** Tailwind classes for payment status badges. */
export const PAYMENT_STATUS_STYLES: Record<string, string> = {
  PENDING:
    "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-900",
  PAID:
    "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-900",
  FAILED:
    "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-900",
  REFUNDED:
    "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700",
};

/* ---------------------------------------------------------------------------
 * Marketplace (Tapsi Garage style) formatters — Toman integers
 * ------------------------------------------------------------------------ */

/** Render a number with Persian grouping (`۳٬۳۲۴٬۲۲۵`) for RTL, Latin otherwise. */
export function formatNumber(value: number, locale: Locale = "fa") {
  return value.toLocaleString(locale === "fa" ? "fa-IR" : "en-US");
}

/** Format an integer Toman price: `۳٬۳۲۴٬۲۲۵ تومان`. */
export function formatToman(value: number, locale: Locale = "fa") {
  return `${formatNumber(value, locale)} ${locale === "fa" ? "تومان" : "Toman"}`;
}

/** Discount percent label, e.g. `٪۸`. */
export function formatPercent(percent: number, locale: Locale = "fa") {
  return locale === "fa" ? `٪${formatNumber(percent, "fa")}` : `${percent}%`;
}

/** Localize any digit-containing string (e.g. phone numbers) for RTL pages. */
export function faDigits(value: string) {
  return value.replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}
