import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductForm } from "@/components/admin/product-form";
import { fetchProduct } from "@/lib/queries";
import type { ProductDetail } from "@/lib/types";
import { serverLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const dict = getDictionary(await serverLocale());
  return { title: dict.admin.products.edit };
}

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<EditSkeleton />}>
      <EditProductContent params={params} />
    </Suspense>
  );
}

/** The product fetch happens here, inside Suspense, so the shell
 * renders instantly and the validator can keep the segment. */
async function EditProductContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const locale = await serverLocale();
  const dict = getDictionary(locale);
  const productId = Number(id);

  let product: ProductDetail | null = null;
  try {
    product = await fetchProduct(productId);
  } catch {
    product = null;
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-bold tracking-tight">
        {dict.admin.products.edit} <span className="text-zinc-400">#{id}</span>
      </h1>
      <div className="mt-6">
        <ProductForm product={product} productId={productId} />
      </div>
    </div>
  );
}

function EditSkeleton() {
  return (
    <div className="mx-auto max-w-xl animate-pulse space-y-4">
      <div className="h-8 w-64 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="h-10 w-full rounded-lg bg-zinc-100 dark:bg-zinc-800" />
        ))}
      </div>
    </div>
  );
}
