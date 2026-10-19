import { Suspense } from "react";
import type { Metadata } from "next";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryContent } from "./category-content";
import { fill, getDictionary, hasLocale } from "@/lib/i18n/dictionaries";

type Params = Promise<{ lang: string; id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang, id } = await params;
  if (!hasLocale(lang)) return {};
  const dict = getDictionary(lang);
  return { title: fill(dict.categories.titleN, { n: id }, lang) };
}

export default function CategoryPage({
  params,
}: {
  params: Params;
}) {
  return (
    <div className="mt-4">
      <Suspense fallback={<Skeleton className="h-72 rounded-xl" />}>
        <CategoryParams params={params} />
      </Suspense>
    </div>
  );
}

/** Unwraps the category id after the route shells in. */
async function CategoryParams({ params }: { params: Params }) {
  const { id } = await params;
  return <CategoryContent categoryId={Number(id)} />;
}
