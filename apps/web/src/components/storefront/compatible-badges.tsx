"use client";

import { useI18n } from "@/components/providers/locale-provider";

/** «مناسب برای:» chips — compatible car models returned by the API. */
export function CompatibleBadges({ vehicles }: { vehicles: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {vehicles.map((vehicle) => (
        <span
          key={vehicle}
          className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
        >
          {vehicle}
        </span>
      ))}
    </div>
  );
}
