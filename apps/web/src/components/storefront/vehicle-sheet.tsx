"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Car, Ban } from "lucide-react";
import { BottomSheet } from "./bottom-sheet";
import { useI18n } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";

interface VehicleSheetProps {
  open: boolean;
  onClose: () => void;
  /** Models available in the current city — only these are worth listing. */
  vehicles: string[];
  currentCar?: string | null;
}

export const CAR_COOKIE = "car";

/**
 * Car-model selection sheet. Choosing a model filters the whole
 * storefront to parts that fit it (or universal items); «همه خودروها»
 * clears the filter.
 */
export function VehicleSheet({
  open,
  onClose,
  vehicles,
  currentCar,
}: VehicleSheetProps) {
  const { dict } = useI18n();
  const router = useRouter();

  function pick(model: string | null) {
    if (model) {
      // Cookie value may not contain parentheses/semicolons; models are
      // Persian names — encodeURIComponent keeps it safe.
      document.cookie = `${CAR_COOKIE}=${encodeURIComponent(model)}; path=/; max-age=31536000; samesite=lax`;
    } else {
      document.cookie = `${CAR_COOKIE}=; path=/; max-age=0; samesite=lax`;
    }
    onClose();
    // Refresh server components so lists re-filter for the new car.
    router.refresh();
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={dict.store.car.choose}
    >
      <ul className="grid grid-cols-2 gap-2">
        <li>
          <button
            onClick={() => pick(null)}
            className={cn(
              "flex w-full items-center justify-center gap-1 rounded-xl border px-2 py-2.5 text-xs font-bold transition-colors",
              !currentCar
                ? "border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                : "border-zinc-200 bg-white text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            )}
          >
            <Ban className="h-3.5 w-3.5" />
            {dict.store.car.allCars}
          </button>
        </li>
        {vehicles.map((model) => (
          <li key={model}>
            <button
              onClick={() => pick(model)}
              className={cn(
                "flex w-full items-center justify-center gap-1 rounded-xl border px-2 py-2.5 text-sm font-medium transition-colors",
                model === currentCar
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                  : "border-zinc-200 bg-white text-zinc-800 hover:border-emerald-500 hover:text-emerald-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              )}
            >
              <Car className="h-3.5 w-3.5 opacity-60" />
              <span className="truncate">{model}</span>
            </button>
          </li>
        ))}
      </ul>
    </BottomSheet>
  );
}
