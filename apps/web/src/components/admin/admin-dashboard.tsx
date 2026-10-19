"use client";

import * as React from "react";
import Link from "next/link";
import { Package, ShoppingCart, Tags, Users, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { errorMessage } from "@/lib/error";
import { formatMoney } from "@/lib/format";
import { useI18n } from "@/components/providers/locale-provider";
import type { Category, Paginated } from "@/lib/types";
import type { Order } from "@/lib/types";
import type { AdminUser } from "@/lib/types";

type MiniList<T> = Paginated<T> | null;

/** Overview: record counts (from paginated endpoints) and the latest orders. */
export function AdminDashboard() {
  const { locale, dict, lp } = useI18n();
  const t = dict.admin.dashboard;
  const [products, setProducts] = React.useState<MiniList<{ id: number }>>(null);
  const [orders, setOrders] = React.useState<MiniList<Order>>(null);
  const [users, setUsers] = React.useState<MiniList<AdminUser>>(null);
  const [categories, setCategories] = React.useState<Category[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const [productsRes, ordersRes, usersRes, categoriesRes] = await Promise.all([
          api<Paginated<{ id: number }>>("/products?limit=1"),
          api<Paginated<Order>>("/orders/admin/all?limit=5"),
          api<Paginated<AdminUser>>("/users?limit=1"),
          api<Category[]>("/categories"),
        ]);
        setProducts(productsRes);
        setOrders(ordersRes);
        setUsers(usersRes);
        setCategories(categoriesRes);
      } catch (err) {
        setError(errorMessage(err));
      }
    })();
  }, []);

  if (error) {
    return <p className="text-sm text-red-600 dark:text-red-400">{error}</p>;
  }

  const stats = [
    { label: t.products, value: products?.meta.total, href: "/admin/products", icon: Package },
    { label: t.categories, value: categories?.length, href: "/admin/categories", icon: Tags },
    { label: t.orders, value: orders?.meta.total, href: "/admin/orders", icon: ShoppingCart },
    { label: t.users, value: users?.meta.total, href: "/admin/users", icon: Users },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, href, icon: Icon }) => (
          <Link
            key={href}
            href={lp(href)}
            className="group rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                <Icon className="h-4 w-4" />
              </span>
              <ArrowRight className="h-4 w-4 text-zinc-300 transition-opacity group-hover:opacity-100 dark:text-zinc-600 rtl:-scale-x-100" />
            </div>
            <p className="mt-3 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {value ?? "…"}
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
          </Link>
        ))}
      </div>

      <h2 className="mt-8 text-lg font-semibold tracking-tight">{t.latestOrders}</h2>
      {orders && orders.data.length > 0 ? (
        <ul className="mt-3 divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
          {orders.data.map((order) => (
            <li key={order.id} className="flex items-center justify-between p-4 text-sm">
              <div>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  #{order.id}
                </span>{" "}
                <span className="text-zinc-500 dark:text-zinc-400">
                  {order.user?.name ?? order.user?.email ?? t.unknownUser}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {dict.status.order[order.status as keyof typeof dict.status.order]}
                </span>
                <span className="font-semibold dark:text-zinc-100">
                  {formatMoney(order.totalAmount, locale)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">{t.loadingOrders}</p>
      )}
    </div>
  );
}
