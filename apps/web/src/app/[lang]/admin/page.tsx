import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { serverLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionaries";

export async function generateMetadata(
  props: PageProps<"/[lang]/admin">
): Promise<Metadata> {
  const locale = await serverLocale();
  return { title: getDictionary(locale).admin.sidebar.dashboard };
}

export default function AdminPage() {
  return <AdminDashboard />;
}
