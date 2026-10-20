"use client";

import { Star, MapPin } from "lucide-react";
import { useI18n } from "@/components/providers/locale-provider";
import { formatNumber } from "@/lib/format";
import type { Vendor } from "@/lib/types";

/** Horizontal rail of verified local vendors for the current city. */
export function VendorRail({ vendors }: { vendors: Vendor[] }) {
  if (vendors.length === 0) return null;
  return (
    <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-3 md:gap-3 md:overflow-visible lg:grid-cols-4">
      {vendors.map((vendor) => (
        <article
          key={vendor.id}
          className="flex w-56 flex-shrink-0 flex-col gap-1.5 rounded-2xl border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900 md:w-auto"
        >
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate text-sm font-bold text-zinc-900 dark:text-zinc-50">
              {vendor.name}
            </h3>
            <span className="inline-flex flex-shrink-0 items-center gap-0.5 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {formatNumber(vendor.rating, "fa")}
            </span>
          </div>
          <p className="flex items-start gap-1 text-[11px] leading-4 text-zinc-500 dark:text-zinc-400">
            <MapPin className="mt-0.5 h-3 w-3 flex-shrink-0" />
            {vendor.address}
          </p>
          <div className="flex flex-wrap gap-1">
            {vendor.services.map((service) => (
              <span
                key={service}
                className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
              >
                {service}
              </span>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
