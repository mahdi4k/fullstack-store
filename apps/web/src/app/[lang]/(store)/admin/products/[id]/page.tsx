import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/product-form";
import { fetchProduct } from "@/lib/queries";
import type { ProductDetail } from "@/lib/types";
import { serverLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const dict = getDictionary(await serverLocale());
  return { title: dict.admin.products.edit };
}

export default async function EditProductPage({
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
