"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Package,
  ShoppingCart,
  Tags,
  Ticket,
  Users,
  LayoutDashboard,
} from "lucide-react";
import { useI18n } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";

/** Vertical navigation for the admin panel. */
export function AdminSidebar() {
  const { dict, lp } = useI18n();
  const pathname = usePathname();

  const NAV = [
    { href: "/admin", label: dict.admin.sidebar.dashboard, icon: LayoutDashboard },
    { href: "/admin/products", label: dict.admin.sidebar.products, icon: Package },
    { href: "/admin/categories", label: dict.admin.sidebar.categories, icon: Tags },
    { href: "/admin/coupons", label: dict.admin.sidebar.coupons, icon: Ticket },
    { href: "/admin/orders", label: dict.admin.sidebar.orders, icon: ShoppingCart },
    { href: "/admin/users", label: dict.admin.sidebar.users, icon: Users },
  ];

  return (
    <aside className="w-full shrink-0 border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 lg:w-56 lg:border-b-0 lg:border-e">
      <div className="flex gap-1 overflow-x-auto p-3 lg:sticky lg:top-16 lg:flex-col lg:overflow-visible">
        {NAV.map(({ href, label, icon: Icon }) => (
          <SidebarLink
            key={href}
            href={lp(href)}
            active={pathname === lp(href)}
            icon={<Icon className="h-4 w-4" />}
          >
            {label}
          </SidebarLink>
        ))}
      </div>
    </aside>
  );
}

function SidebarLink({
  href,
  icon,
  active,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900"
          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
      )}
    >
      {icon}
      {children}
    </Link>
  );
}
