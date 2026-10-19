"use client";

import Link from "next/link";
import { useI18n } from "@/components/providers/locale-provider";

/** Section header row with optional «همه» view-all link. */
export function SectionHeader({
  title,
  href,
}: {
  title: string;
  href?: string;
}) {
  const { dict, locale } = useI18n();
  return (
    <div className="mb-3 flex items-end justify-between">
      <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">{title}</h2>
      {href ? (
        <Link
          href={href}
          className="text-xs font-medium text-emerald-700 hover:underline dark:text-emerald-400"
        >
          {dict.store.sections.viewAll}
        </Link>
      ) : null}
    </div>
  );
}
