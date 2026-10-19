import "server-only";

import { lang } from "next/root-params";
import { notFound } from "next/navigation";
import type { Locale } from "./config";
import { hasLocale } from "./dictionaries";

/**
 * Server Components read the root `[lang]` param directly — no prop drilling.
 * Unknown locales 404, so callers always receive a valid `Locale`.
 */
export async function serverLocale(): Promise<Locale> {
  const value = await lang();
  if (!hasLocale(value)) notFound();
  return value;
}
