"use client";

import * as React from "react";
import { localePath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

interface LocaleContextValue {
  locale: Locale;
  /** `rtl` for Persian, `ltr` for English. */
  dir: "rtl" | "ltr";
  dict: Dictionary;
  /** Prefix an internal path with the active locale for Link/router calls. */
  lp: (path: string) => string;
}

const LocaleContext = React.createContext<LocaleContextValue | null>(null);

/** Seed the locale and dictionary from the [lang] root layout. */
export function LocaleProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Dictionary;
  children: React.ReactNode;
}) {
  const value = React.useMemo<LocaleContextValue>(
    () => ({
      locale,
      dir: locale === "fa" ? "rtl" : "ltr",
      dict,
      lp: (path: string) => localePath(locale, path),
    }),
    [locale, dict]
  );
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

/** Access the active locale, dictionary and locale-aware path helper. */
export function useI18n(): LocaleContextValue {
  const ctx = React.useContext(LocaleContext);
  if (!ctx) throw new Error("useI18n must be used inside <LocaleProvider>");
  return ctx;
}
