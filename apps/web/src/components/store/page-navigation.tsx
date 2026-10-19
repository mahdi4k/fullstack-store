import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const WINDOW = 2; // pages shown around the current one

function buildHref(basePath: string, query: Record<string, string>, page: number) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (key !== "page" && value) params.set(key, value);
  }
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

/**
 * Server-rendered pagination that preserves the current query
 * (search, filters, sort) while moving between pages. `basePath` is the
 * already locale-prefixed catalog path.
 */
export function PageNavigation({
  basePath,
  page,
  totalPages,
  query,
  ariaLabel,
  prevLabel,
  nextLabel,
}: {
  basePath: string;
  page: number;
  totalPages: number;
  query: Record<string, string>;
  ariaLabel: string;
  prevLabel: string;
  nextLabel: string;
}) {
  if (totalPages <= 1) return null;
  return (
    <nav className="mt-8 flex items-center justify-center gap-1" aria-label={ariaLabel}>
      <NavArrow
        href={buildHref(basePath, query, page - 1)}
        disabled={page <= 1}
        icon={<ChevronLeft className="h-4 w-4 rtl:-scale-x-100" />}
        label={prevLabel}
      />
      {page - WINDOW > 1 ? <Ellipsis /> : null}
      {range(page, totalPages, WINDOW).map((value) => (
        <Link
          key={value}
          href={buildHref(basePath, query, value)}
          aria-current={value === page ? "page" : undefined}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors",
            value === page
              ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900"
              : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          )}
        >
          {value}
        </Link>
      ))}
      {page + WINDOW < totalPages ? <Ellipsis /> : null}
      <NavArrow
        href={buildHref(basePath, query, page + 1)}
        disabled={page >= totalPages}
        icon={<ChevronRight className="h-4 w-4 rtl:-scale-x-100" />}
        label={nextLabel}
      />
    </nav>
  );
}

function range(current: number, total: number, window: number) {
  const from = Math.max(1, current - window);
  const to = Math.min(total, current + window);
  const result = [];
  for (let i = from; i <= to; i += 1) result.push(i);
  return result;
}

function NavArrow({
  href,
  disabled,
  icon,
  label,
}: {
  href: string;
  disabled: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  if (disabled) {
    return (
      <span
        className="flex h-9 w-9 items-center justify-center rounded-md text-zinc-300 dark:text-zinc-600"
        aria-disabled
      >
        {icon}
      </span>
    );
  }
  return (
    <Link
      href={href}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-md text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
    >
      {icon}
    </Link>
  );
}

function Ellipsis() {
  return <span className="px-1 text-zinc-400">…</span>;
}
