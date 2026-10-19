import type { Metadata } from "next";
import { AdminUsersView } from "@/components/admin/admin-users-view";
import { serverLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const dict = getDictionary(await serverLocale());
  return { title: `${dict.admin.sidebar.dashboard} · ${dict.admin.sidebar.users}` };
}

export default function AdminUsersPage() {
  return <AdminUsersView />;
}
