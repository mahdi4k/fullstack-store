"use client";

import Link from "next/link";
import { ShieldCheck, AlertTriangle, CreditCard, LifeBuoy } from "lucide-react";
import { useI18n } from "@/components/providers/locale-provider";

/** Utility tiles row: بیمه خودرو، خلافی، خرید قسطی، زنجیر امداد. */
export function UtilitiesSection({ citySlug }: { citySlug: string }) {
  const { dict, locale } = useI18n();

  const tiles = [
    { key: "insurance", icon: ShieldCheck, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/40" },
    { key: "violations", icon: AlertTriangle, color: "text-amber-600 bg-amber-50 dark:bg-amber-900/40" },
    { key: "installment", icon: CreditCard, color: "text-sky-600 bg-sky-50 dark:bg-sky-900/40" },
    { key: "roadside", icon: LifeBuoy, color: "text-rose-600 bg-rose-50 dark:bg-rose-900/40" },
  ] as const;

  return (
    <ul className="grid grid-cols-4 gap-2">
      {tiles.map(({ key, icon: Icon, color }) => (
        <li key={key}>
          <Link
            href={`/${locale}/city/${citySlug}`}
            className="flex flex-col items-center gap-1.5 rounded-2xl border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900"
          >
            <span className={`flex h-9 w-9 items-center justify-center rounded-full ${color}`}>
              <Icon className="h-4.5 w-4.5" />
            </span>
            <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-200">
              {dict.store.utilities[key]}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
