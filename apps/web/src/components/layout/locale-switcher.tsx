"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Languages } from "lucide-react";
import { useI18n } from "@/components/providers/locale-provider";
import { LOCALE_COOKIE, otherLocale } from "@/lib/i18n/config";

/**
 * Language switcher: jumps to the same page under the other locale prefix
 * (fa ⇄ en), preserving the current search params, and remembers the choice
 * in the `NEXT_LOCALE` cookie used by proxy.ts.
 */
export function LocaleSwitcher() {
  const { locale, dict } = useI18n();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const target = otherLocale(locale);
  const rest = pathname.replace(/^\/(fa|en)(?=\/|$)/, "");
  const targetPath = `/${target}${rest}`;
  const qs = searchParams.toString();
  const href = qs ? `${targetPath}?${qs}` : targetPath;

  return (
    <Link
      href={href}
      hrefLang={target}
      aria-label={dict.lang.switchAria}
      onClick={() => {
        if (typeof document !== "undefined") {
          document.cookie = `${LOCALE_COOKIE}=${target}; path=/; max-age=31536000; samesite=lax`;
        }
      }}
      className="flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
    >
      <Languages className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{dict.lang[target]}</span>
      <span className="sm:hidden">{target.toUpperCase()}</span>
    </Link>
  );
}
