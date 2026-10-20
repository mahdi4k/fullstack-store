"use client";

import Link from "next/link";
import type { Banner } from "@/lib/types";

/**
 * Auto-advancing hero banner slider (banners from the storefront API,
 * links point at category listings). Scrolls horizontally with snap.
 */
export function HeroSlider({ banners }: { banners: Banner[] }) {
  if (banners.length === 0) return null;
  return (
    <div className="relative">
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {banners.map((banner) => (
          <Link
            key={banner.id}
            href={banner.link ?? "#"}
            className="flex w-full flex-shrink-0 snap-center flex-col justify-center gap-1 rounded-2xl md:w-[calc(50%-0.375rem)] lg:w-[calc(33.333%-0.5rem)] bg-gradient-to-l from-emerald-700 to-emerald-500 px-5 py-6 text-white dark:from-emerald-800 dark:to-emerald-600"
          >
            <span className="text-base font-extrabold">{banner.title}</span>
            {banner.subtitle ? (
              <span className="text-xs text-white/85">{banner.subtitle}</span>
            ) : null}
          </Link>
        ))}
      </div>
      {banners.length > 1 ? (
        <div className="mt-2 flex justify-center gap-1.5">
          {banners.map((banner) => (
            <span key={banner.id} className="h-1.5 w-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600" />
          ))}
        </div>
      ) : null}
    </div>
  );
}
