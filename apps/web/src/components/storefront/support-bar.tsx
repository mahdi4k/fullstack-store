"use client";

import { Phone } from "lucide-react";
import { useI18n } from "@/components/providers/locale-provider";

/** Support / click-to-call footer bar: `tel:02141630345`. */
export function SupportBar() {
  const { dict } = useI18n();
  return (
    <a
      href="tel:02141630345"
      className="flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white py-3 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300">
        <Phone className="h-3.5 w-3.5" />
      </span>
      {dict.store.support.call}
    </a>
  );
}
