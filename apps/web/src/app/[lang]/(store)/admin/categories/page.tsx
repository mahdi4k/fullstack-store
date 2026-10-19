import type { Metadata } from "next";
import { AdminCategoriesView } from "@/components/admin/admin-categories-view";
import { serverLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const dict = getDictionary(await serverLocale());
  return { title: `${dict.admin.sidebar.dashboard} · ${dict.admin.sidebar.categories}` };
}

export default function AdminCategoriesPage() {
  return <AdminCategoriesView />;
}
