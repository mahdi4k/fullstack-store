import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale } from "@/lib/i18n/config";

/**
 * Locale routing (formerly middleware, now `proxy` in Next.js 16):
 * every non-prefixed path is redirected to the locale prefix. Persian (fa)
 * is the default; returning visitors get their previously chosen language
 * from the `NEXT_LOCALE` cookie (set by the language switcher).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Already locale-prefixed → nothing to do.
  if (/^\/(fa|en)(\/|$)/.test(pathname)) return;

  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(saved) ? saved : DEFAULT_LOCALE;

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip internal assets and any file with an extension (favicon, images…).
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
