"use client";

import { useI18n } from "@/components/providers/locale-provider";

/** "In stock only" checkbox styled as a toolbar pill. */
export function InStockToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  const { dict } = useI18n();
  return (
    <label className="flex h-9 cursor-pointer select-none items-center gap-2 whitespace-nowrap rounded-md border border-zinc-200 px-3 text-sm text-zinc-700 shadow-sm dark:border-zinc-800 dark:text-zinc-300">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-3.5 w-3.5 accent-zinc-900 dark:accent-zinc-100"
      />
      {dict.catalog.inStockOnly}
    </label>
  );
}
