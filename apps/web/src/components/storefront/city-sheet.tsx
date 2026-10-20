"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { MapPin, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { BottomSheet } from "./bottom-sheet";
import { useI18n } from "@/components/providers/locale-provider";
import { fetchCities } from "@/lib/storefront";
import { FALLBACK_CITIES } from "@/lib/city";
import { cn } from "@/lib/utils";

interface CityListEntry {
  slug: string;
  name: string;
}

interface CitySheetProps {
  open: boolean;
  onClose: () => void;
  /** Currently active city (shows a check mark). */
  currentCity?: string;
  /** Cart city for conflict detection; omitted on the entry gate. */
  cartCity?: string | null;
  /** Show the "cart belongs to another city" conflict alert. */
  conflict?: boolean;
}

/**
 * City selection bottom sheet — used both by the `/` gate (initial
 * choice) and the storefront header badge (switch city). Persists the
 * choice in a `city` cookie and navigates to `/[locale]/city/[slug]`.
 */
export function CitySheet({
  open,
  onClose,
  currentCity,
  cartCity,
  conflict = false,
}: CitySheetProps) {
  const { dict, locale } = useI18n();
  const router = useRouter();
  const [busy, setBusy] = React.useState<string | null>(null);

  const { data: cities } = useQuery({
    queryKey: ["cities"],
    queryFn: fetchCities,
    staleTime: 5 * 60_000,
  });

  const list: CityListEntry[] =
    cities?.map((c) => ({ slug: c.slug, name: c.name })) ?? [...FALLBACK_CITIES];

  function pick(city: CityListEntry) {
    if (city.slug === currentCity) {
      onClose();
      return;
    }
    if (conflict && cartCity && cartCity !== city.slug) {
      const confirmed = window.confirm(
        `${dict.store.city.conflictTitle}\n${dict.store.city.conflictBody}`
      );
      if (!confirmed) return;
    }
    setBusy(city.slug);
    // Persist for 1 year; `path=/` makes it readable server-side in the gate.
    document.cookie = `city=${city.slug}; path=/; max-age=31536000; samesite=lax`;
    onClose();
    router.push(`/${locale}/city/${city.slug}`);
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={dict.store.city.choose}>
      {conflict && cartCity ? (
        <p className="mb-3 rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
          {dict.store.city.conflictBody}
        </p>
      ) : null}
      <ul className="grid grid-cols-3 gap-2">
        {list.map((city) => (
          <li key={city.slug}>
            <button
              disabled={busy !== null}
              onClick={() => pick(city)}
              className={cn(
                "flex w-full items-center justify-center gap-1 rounded-xl border px-2 py-3 text-sm font-medium transition-colors",
                "border-zinc-200 bg-white text-zinc-800 hover:border-emerald-500 hover:text-emerald-700 disabled:opacity-50",
                "dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:border-emerald-500",
                city.slug === currentCity && "border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
              )}
            >
              {city.slug === currentCity ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <MapPin className="h-3.5 w-3.5 opacity-50" />
              )}
              <span className="truncate">{city.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </BottomSheet>
  );
}
