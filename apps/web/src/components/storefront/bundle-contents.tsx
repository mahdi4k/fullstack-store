"use client";

import { useI18n } from "@/components/providers/locale-provider";

/**
 * Bundle contents list («روغن موتور ۴ لیتری + فیلتر روغن + فیلتر هوا»).
 * Extracts the `+`-separated parts from the product description.
 */
export function BundleContents({ description }: { description: string | null }) {
  const { dict } = useI18n();
  if (!description) return null;

  const parts = description
    .replace(/^.*?فیلتر روغن[^.]*\./, "روغن موتور + فیلتر روغن")
    .split(/\s*\+\s*/)
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <section>
      <p className="mb-1.5 text-xs font-bold text-zinc-500">{dict.store.product.includes}</p>
      <ul className="space-y-1 rounded-xl border border-zinc-200 p-3 text-xs leading-5 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
        {parts.map((part, index) => (
          <li key={index} className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />
            {part}
          </li>
        ))}
      </ul>
    </section>
  );
}
