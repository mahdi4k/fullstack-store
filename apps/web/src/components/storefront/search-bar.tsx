"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { useI18n } from "@/components/providers/locale-provider";

interface SearchBarProps {
  citySlug: string;
  /** Initial value (e.g. `?q=` on the search listing). */
  initialQuery?: string;
}

/** Debounced live search: queries name or compatible car model (`پراید`, `206`, `لنت`…). */
export function SearchBar({ citySlug, initialQuery = "" }: SearchBarProps) {
  const { dict, locale } = useI18n();
  const router = useRouter();
  const [value, setValue] = React.useState(initialQuery);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  function onInput(next: string) {
    setValue(next);
    if (timer.current) clearTimeout(timer.current);
    const q = next.trim();
    timer.current = setTimeout(() => {
      if (q) {
        router.push(`/${locale}/city/${citySlug}/category/search?q=${encodeURIComponent(q)}`);
      }
    }, 400);
  }

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute top-1/2 start-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
      <input
        value={value}
        onChange={(e) => onInput(e.target.value)}
        type="search"
        placeholder={dict.store.header.searchPlaceholder}
        aria-label={dict.store.header.searchAria}
        className="h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 ps-9 pe-9 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-emerald-500 focus:bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:bg-zinc-900"
      />
      {value ? (
        <button
          onClick={() => {
            setValue("");
            if (timer.current) clearTimeout(timer.current);
          }}
          className="absolute top-1/2 end-2 -translate-y-1/2 rounded-full p-1 text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}
