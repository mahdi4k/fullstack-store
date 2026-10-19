import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/product-form";
import { serverLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const dict = getDictionary(await serverLocale());
  return { title: dict.admin.products.new };
}

export default function NewProductPage() {
  return <NewProductContent />;
}

async function NewProductContent() {
  const dict = getDictionary(await serverLocale());
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-bold tracking-tight">{dict.admin.products.new}</h1>
      <div className="mt-6">
        <ProductForm />
      </div>
    </div>
  );
}
