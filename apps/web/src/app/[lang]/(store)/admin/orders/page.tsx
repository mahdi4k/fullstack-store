import type { Metadata } from "next";
import { AdminOrdersView } from "@/components/admin/admin-orders-view";
import { serverLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const dict = getDictionary(await serverLocale());
  return { title: `${dict.admin.sidebar.dashboard} · ${dict.admin.sidebar.orders}` };
}

export default function AdminOrdersPage() {
  return <AdminOrdersView />;
}
