import Link from "next/link";
import { ApiErrorCard } from "@/components/ui/api-error-card";
import { ProductGrid } from "@/components/store/product-grid";
import { fetchCategory } from "@/lib/queries";
import type { Category } from "@/lib/types";
import { serverLocale } from "@/lib/i18n/server";
import { getDictionary, plural } from "@/lib/i18n/dictionaries";
import { localePath } from "@/lib/i18n/config";

/** Category header plus its latest 20 products (backend `take: 20`). */
export async function CategoryContent({ categoryId }: { categoryId: number }) {
  const locale = await serverLocale();
  const dict = getDictionary(locale);

  let category: Category;

  try {
    category = await fetchCategory(categoryId);
  } catch (error) {
    return <ApiErrorCard error={error as Error} />;
  }

  const total = category._count?.products ?? 0;

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">{category.name}</h1>
      {category.description ? (
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {category.description}
        </p>
      ) : null}

      <div className="mt-6">
        <ProductGrid products={category.products ?? []} />
      </div>

      <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
        {plural(total, dict.categories.total, locale)} ·{" "}
        <Link
          href={`${localePath(locale, "/products")}?categoryId=${category.id}`}
          className="underline underline-offset-4 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          {dict.categories.seeAll}
        </Link>
      </p>
    </>
  );
}
