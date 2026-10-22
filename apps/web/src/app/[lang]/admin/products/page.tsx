import type { Metadata } from "next";
import { AdminProductsView } from "@/components/admin/admin-products-view";
import { serverLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const dict = getDictionary(await serverLocale());
  return { title: `${dict.admin.sidebar.dashboard} · ${dict.admin.sidebar.products}` };
}

export default function AdminProductsPage() {
  return <AdminProductsView />;
}
