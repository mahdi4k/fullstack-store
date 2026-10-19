import { Suspense } from "react";
import { RequireAdmin } from "@/components/providers/auth-provider";
import { AdminSidebar } from "@/components/layout/admin-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAdmin>
      <div className="mx-auto flex max-w-6xl gap-0 lg:py-0">
        {/* Sidebar highlights the active route, so stream it after the shell */}
        <Suspense fallback={<div className="hidden w-56 shrink-0 border-r border-zinc-200 dark:border-zinc-800 lg:block" />}>
          <AdminSidebar />
        </Suspense>
        <div className="min-w-0 flex-1 px-6 py-8">{children}</div>
      </div>
    </RequireAdmin>
  );
}
