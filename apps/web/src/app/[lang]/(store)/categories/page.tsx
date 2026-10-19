import { Suspense } from "react";
import type { Metadata } from "next";
import { Tags } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiErrorCard } from "@/components/ui/api-error-card";
import { fetchCategories } from "@/lib/queries";
import type { Category } from "@/lib/types";
import { serverLocale } from "@/lib/i18n/server";
import { getDictionary, plural } from "@/lib/i18n/dictionaries";
import { localePath } from "@/lib/i18n/config";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/categories">): Promise<Metadata> {
  const { lang } = await params;
  return { title: getDictionary(lang as never).categories.title };
}

export default function CategoriesPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <CategoriesHeader />
      <div className="mt-6">
        <Suspense fallback={<GridSkeleton />}>
          <CategoriesContent />
        </Suspense>
      </div>
    </div>
  );
}

async function CategoriesHeader() {
  const dict = getDictionary(await serverLocale());
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">{dict.categories.title}</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        {dict.categories.subtitle}
      </p>
    </>
  );
}

async function CategoriesContent() {
  const locale = await serverLocale();
  const dict = getDictionary(locale);

  let categories: Category[];
  try {
    categories = await fetchCategories();
  } catch (error) {
    return <ApiErrorCard error={error as Error} />;
  }

  if (categories.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-200 py-14 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        {dict.categories.none}
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <CategoryTile key={category.id} category={category} />
      ))}
    </div>
  );
}

async function CategoryTile({ category }: { category: Category }) {
  const locale = await serverLocale();
  const dict = getDictionary(locale);
  const count = category._count?.products ?? 0;
  return (
    <a
      href={`${localePath(locale, "/products")}?categoryId=${category.id}`}
      className="group rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">
        <Tags className="h-5 w-5" />
      </div>
      <h2 className="mt-3 font-semibold text-zinc-900 group-hover:underline dark:text-zinc-100">
        {category.name}
      </h2>
      {category.description ? (
        <p className="mt-1 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
          {category.description}
        </p>
      ) : null}
      <p className="mt-3 text-xs text-zinc-400">
        {plural(count, dict.categories.products, locale)}
      </p>
    </a>
  );
}

function GridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton key={index} className="h-36 rounded-xl" />
      ))}
    </div>
  );
}
