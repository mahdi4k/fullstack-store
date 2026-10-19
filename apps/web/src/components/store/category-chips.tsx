import Link from "next/link";
import { Tags } from "lucide-react";
import { fetchCategories } from "@/lib/queries";
import { serverLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localePath } from "@/lib/i18n/config";

/**
 * Category shortcut pills for the landing page.
 * Shows a quiet fallback if the API is unreachable so the page still works.
 */
export async function CategoryChips() {
  const locale = await serverLocale();
  const dict = getDictionary(locale);
  let categories;
  let failed = false;

  try {
    categories = await fetchCategories();
  } catch {
    failed = true;
  }

  if (failed || !categories) {
    return (
      <p className="text-center text-sm text-zinc-400">{dict.errors.categoriesOffline}</p>
    );
  }

  if (categories.length === 0) return null;

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {categories.slice(0, 8).map((category) => (
        <Link
          key={category.id}
          href={`${localePath(locale, "/products")}?categoryId=${category.id}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-sm text-zinc-700 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <Tags className="h-3.5 w-3.5 text-zinc-400" />
          {category.name}
        </Link>
      ))}
    </div>
  );
}
