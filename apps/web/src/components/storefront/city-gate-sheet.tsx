"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { MapPin, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchCities } from "@/lib/storefront";
import { FALLBACK_CITIES, CITY_COOKIE } from "@/lib/city";
import { useI18n } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface CityListEntry {
  slug: string;
  name: string;
}

/**
 * Full-page city gate shown on `/` when no `city` cookie exists yet.
 * Once a city is picked the cookie is written and we move to its
 * storefront page.
 */
export function CityGateSheet() {
  const { dict, locale } = useI18n();
  const router = useRouter();
  const [busy, setBusy] = React.useState<string | null>(null);

  const { data: cities, isLoading } = useQuery({
    queryKey: ["cities"],
    queryFn: fetchCities,
    staleTime: 5 * 60_000,
  });

  const list: CityListEntry[] =
    cities?.map((c) => ({ slug: c.slug, name: c.name })) ?? [...FALLBACK_CITIES];

  function pick(city: CityListEntry) {
    setBusy(city.slug);
    document.cookie = `${CITY_COOKIE}=${city.slug}; path=/; max-age=31536000; samesite=lax`;
    router.push(`/${locale}/city/${city.slug}`);
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg">
            <MapPin className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
            {dict.store.city.choose}
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {dict.store.gate.subtitle}
          </p>
        </div>

        <ul className="grid grid-cols-3 gap-2">
          {isLoading && busy === null
            ? Array.from({ length: 6 }, (_, i) => (
                <li key={i}>
                  <Skeleton className="h-14 w-full rounded-xl" />
                </li>
              ))
            : list.map((city) => (
                <li key={city.slug}>
                  <button
                    disabled={busy !== null || isLoading}
                    onClick={() => pick(city)}
                    className={cn(
                      "flex w-full flex-col items-center justify-center gap-1 rounded-xl border border-zinc-200 bg-white px-2 py-3 text-sm font-medium text-zinc-800 transition-colors hover:border-emerald-500 hover:text-emerald-700 disabled:opacity-50",
                      "dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-emerald-500"
                    )}
                  >
                    {busy === city.slug ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <MapPin className="h-4 w-4 text-emerald-600/60" />
                    )}
                    <span className="truncate">{city.name}</span>
                  </button>
                </li>
              ))}
        </ul>
      </div>
    </div>
  );
}
