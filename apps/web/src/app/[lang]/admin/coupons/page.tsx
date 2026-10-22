import type { Metadata } from "next";
import { AdminCouponsView } from "@/components/admin/admin-coupons-view";
import { serverLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const dict = getDictionary(await serverLocale());
  return { title: `${dict.admin.sidebar.dashboard} · ${dict.admin.sidebar.coupons}` };
}

export default function AdminCouponsPage() {
  return <AdminCouponsView />;
}
