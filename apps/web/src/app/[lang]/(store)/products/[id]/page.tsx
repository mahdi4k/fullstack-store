import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductContent } from "./product-content";
import { serverLocale } from "@/lib/i18n/server";
import { getDictionary, fill, hasLocale } from "@/lib/i18n/dictionaries";
import { localePath } from "@/lib/i18n/config";

type Params = Promise<{ lang: string; id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang, id } = await params;
  if (!hasLocale(lang)) return {};
  const dict = getDictionary(lang);
  return { title: fill(dict.products.titleN, { n: id }, lang) };
}

export default async function ProductPage({ params }: { params: Params }) {
  const locale = await serverLocale();
  const dict = getDictionary(locale);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <Link
        href={localePath(locale, "/products")}
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        <ArrowLeft className="h-3.5 w-3.5 rtl:-scale-x-100" /> {dict.products.backToShop}
      </Link>

      <div className="mt-4">
        <Suspense fallback={<ProductSkeleton />}>
          <ProductParams params={params} />
        </Suspense>
      </div>
    </div>
  );
}

/** Unwraps the product id after the route shells in. */
async function ProductParams({ params }: { params: Params }) {
  const { id } = await params;
  return <ProductContent productId={Number(id)} />;
}

function ProductSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <Skeleton className="aspect-square w-full rounded-xl" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-3/4" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
