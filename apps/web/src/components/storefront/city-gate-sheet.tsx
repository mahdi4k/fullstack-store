"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { MapPin, Check, Car, Ban } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchCities, fetchStorefront } from "@/lib/storefront";
import { FALLBACK_CITIES, CITY_COOKIE, CAR_COOKIE } from "@/lib/city";
import { useI18n } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface CityListEntry {
  slug: string;
  name: string;
}

/**
 * Full-page entry gate: step 1 picks the city, step 2 picks the car
 * model (only models that actually have parts in that city). Both
 * choices persist in cookies and land the user on the storefront.
 */
export function CityGateSheet() {
  const { dict, locale } = useI18n();
  const router = useRouter();
  const [step, setStep] = React.useState<"city" | "car">("city");
  const [city, setCity] = React.useState<CityListEntry | null>(null);
  const [busy, setBusy] = React.useState<string | null>(null);

  const { data: cities, isLoading } = useQuery({
    queryKey: ["cities"],
    queryFn: fetchCities,
    staleTime: 5 * 60_000,
  });

  // Car models that actually have products in the picked city.
  const { data: storefront, isFetching } = useQuery({
    queryKey: ["gate-vehicles", city?.slug],
    enabled: step === "car" && city !== null,
    queryFn: () => fetchStorefront(city!.slug),
    staleTime: 5 * 60_000,
  });
  const vehicles = storefront?.vehicles ?? [];

  function pickCity(entry: CityListEntry) {
    setBusy(entry.slug);
    // Persist for 1 year; `path=/` makes it readable server-side.
    document.cookie = `${CITY_COOKIE}=${entry.slug}; path=/; max-age=31536000; samesite=lax`;
    setCity(entry);
    setStep("car");
  }

  function pickCar(model: string | null) {
    if (model) {
      document.cookie = `${CAR_COOKIE}=${encodeURIComponent(model)}; path=/; max-age=31536000; samesite=lax`;
    } else {
      // No car chosen — delete cookie so server reads "all cars".
      document.cookie = `${CAR_COOKIE}=; path=/; max-age=0; samesite=lax`;
    }
    router.push(`/${locale}/city/${city!.slug}`);
  }

  const list: CityListEntry[] =
    cities?.map((c) => ({ slug: c.slug, name: c.name })) ?? [...FALLBACK_CITIES];

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg">
            {step === "city" ? <MapPin className="h-8 w-8" /> : <Car className="h-8 w-8" />}
          </div>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
            {step === "city" ? dict.store.city.choose : dict.store.car.choose}
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {step === "city"
              ? dict.store.gate.subtitle
              : dict.store.car.subtitle}
          </p>
        </div>

        {step === "city" ? (
          <>
            <ul className="grid grid-cols-3 gap-2">
              {isLoading
                ? Array.from({ length: 6 }, (_, i) => (
                    <li key={i}>
                      <Skeleton className="h-14 w-full rounded-xl" />
                    </li>
                  ))
                : list.map((entry) => (
                    <li key={entry.slug}>
                      <button
                        disabled={busy !== null || isLoading}
                        onClick={() => pickCity(entry)}
                        className={cn(
                          "flex w-full flex-col items-center justify-center gap-1 rounded-xl border border-zinc-200 bg-white px-2 py-3 text-sm font-medium text-zinc-800 transition-colors hover:border-emerald-500 hover:text-emerald-700 disabled:opacity-50",
                          "dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-emerald-500"
                        )}
                      >
                        {busy === entry.slug ? (
                          <Check className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <MapPin className="h-4 w-4 text-emerald-600/60" />
                        )}
                        <span className="truncate">{entry.name}</span>
                      </button>
                    </li>
                  ))}
            </ul>
          </>
        ) : (
          <ul className="grid grid-cols-2 gap-2">
            <li>
              <button
                onClick={() => pickCar(null)}
                className="flex w-full flex-col items-center justify-center gap-1 rounded-xl border border-zinc-200 bg-white px-2 py-3 text-xs font-bold text-zinc-600 transition-colors hover:border-emerald-500 hover:text-emerald-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
              >
                <Ban className="h-4 w-4 text-emerald-600/70" />
                {dict.store.car.allCars}
              </button>
            </li>
            {isFetching
              ? Array.from({ length: 7 }, (_, i) => (
                  <li key={i}>
                    <Skeleton className="h-11 w-full rounded-xl" />
                  </li>
                ))
              : vehicles.map((model) => (
                  <li key={model}>
                    <button
                      onClick={() => pickCar(model)}
                      className="flex w-full items-center justify-center gap-1 rounded-xl border border-zinc-200 bg-white px-2 py-2.5 text-sm font-medium text-zinc-800 transition-colors hover:border-emerald-500 hover:text-emerald-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                    >
                      <Car className="h-3.5 w-3.5 text-emerald-600/60" />
                      <span className="truncate">{model}</span>
                    </button>
                  </li>
                ))}
          </ul>
        )}

        {step === "car" ? (
          <button
            onClick={() => setStep("city")}
            className="mt-5 w-full text-center text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            ← {dict.store.header.back}
          </button>
        ) : null}
      </div>
    </div>
  );
}
