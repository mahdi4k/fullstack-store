"use client";

import * as React from "react";
import Link from "next/link";
import {
  Package,
  ShoppingCart,
  Tags,
  Users,
  Clock,
  Banknote,
  TrendingDown,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { api } from "@/lib/api";
import { errorMessage } from "@/lib/error";
import { formatToman, formatNumber, faDigits } from "@/lib/format";
import { useI18n } from "@/components/providers/locale-provider";
import type { Order, StoreStats } from "@/lib/types";
import { PAYMENT_STATUS_STYLES } from "@/lib/format";

type Stats = StoreStats | null;

/**
 * Admin dashboard: live overview numbers (`GET /stats`), quick links,
 * best sellers, low stock and the latest orders.
 */
export function AdminDashboard() {
  const { locale, dict, lp } = useI18n();
  const t = dict.admin.dashboard;
  const [stats, setStats] = React.useState<Stats>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const fetched = await api<StoreStats>("/stats");
        if (!cancelled) setStats(fetched);
      } catch (err) {
        if (!cancelled) setError(errorMessage(err));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = stats
    ? [
        {
          icon: ShoppingCart,
          value: formatNumber(stats.totalOrders, locale),
          label: t.totalOrders,
        },
        {
          icon: Banknote,
          value: formatToman(stats.revenue, locale),
          label: t.revenue,
        },
        {
          icon: Clock,
          value: formatNumber(stats.pendingOrders, locale),
          label: t.pendingOrders,
        },
        {
          icon: TrendingDown,
          value: formatNumber(stats.todayOrders, locale),
          label: t.todayOrders,
        },
        {
          icon: Users,
          value: formatNumber(stats.totalCustomers, locale),
          label: t.customers,
        },
      ]
    : Array.from({ length: 5 }, (_, i) => ({ icon: Package, value: "", label: "" }));

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <h1 className="text-xl font-bold tracking-tight">{t.title}</h1>

      {/* Overview counters */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((card, index) => (
          <div
            key={index}
            className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <card.icon className="mb-2 h-5 w-5 text-emerald-600" />
            <p className="text-xl font-extrabold text-zinc-900 tabular-nums dark:text-zinc-50">
              {card.value || "—"}
            </p>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {card.label}
            </p>
          </div>
        ))}
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      ) : null}

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { href: "/admin/products", label: dict.admin.sidebar.products, icon: Package },
          { href: "/admin/coupons", label: dict.admin.sidebar.coupons, icon: Tags },
          { href: "/admin/orders", label: dict.admin.sidebar.orders, icon: ShoppingCart },
          { href: "/admin/users", label: dict.admin.sidebar.users, icon: Users },
        ].map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={lp(href)}
            className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 text-sm font-semibold text-zinc-800 shadow-sm transition-colors hover:border-emerald-500 hover:text-emerald-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
          >
            <Icon className="h-5 w-5 text-emerald-600" />
            {label}
            <ArrowRight className="ms-auto h-4 w-4 text-zinc-400 rtl:-scale-x-100" />
          </Link>
        ))}
      </div>

      {stats ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Best sellers */}
          <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-3 text-sm font-bold">{t.bestSellers}</h2>
            {stats.bestSellers.length === 0 ? (
              <p className="py-6 text-center text-xs text-zinc-400">{t.empty}</p>
            ) : (
              <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {stats.bestSellers.map((product, index) => (
                  <li key={product.productId} className="flex items-center gap-3 py-2 text-sm">
                    <span className="w-5 text-center text-xs font-bold text-zinc-400">
                      {faDigits(String(index + 1))}
                    </span>
                    <span className="line-clamp-1 flex-1 text-zinc-800 dark:text-zinc-200">
                      {product.name}
                    </span>
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      {formatNumber(product.quantity, locale)} {t.sold}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Low stock */}
          <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              {t.lowStock}
            </h2>
            {stats.lowStockProducts.length === 0 ? (
              <p className="py-6 text-center text-xs text-zinc-400">{t.stockHealthy}</p>
            ) : (
              <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {stats.lowStockProducts.map((product) => (
                  <li key={product.id} className="flex items-center gap-3 py-2 text-sm">
                    <span className="line-clamp-1 flex-1 text-zinc-800 dark:text-zinc-200">
                      {product.name}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        product.stock <= 0
                          ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                      }`}
                    >
                      {t.stockCount.replace("{n}", formatNumber(product.stock, locale))}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      ) : null}

      {/* Recent orders */}
      <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="border-b border-zinc-100 px-4 py-3 text-sm font-bold dark:border-zinc-800">
          {t.latestOrders}
        </h2>
        {!stats ? (
          <p className="px-4 py-8 text-center text-xs text-zinc-400">
            {t.loading}
          </p>
        ) : (
          <table className="w-full text-start text-sm">
            <thead>
              <tr className="border-b border-zinc-100 text-xs text-zinc-500 dark:border-zinc-800">
                <th className="px-4 py-2 text-start font-medium">{t.orderId}</th>
                <th className="px-4 py-2 text-start font-medium">{t.customer}</th>
                <th className="px-4 py-2 text-start font-medium">{t.total}</th>
                <th className="hidden px-4 py-2 text-start font-medium sm:table-cell">
                  {t.status}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {stats.recentOrders.map((order) => (
                <tr key={order.id} className="text-zinc-800 dark:text-zinc-200">
                  <td className="px-4 py-2 font-semibold">
                    <Link
                      href={lp(`/admin/orders`)}
                      className="hover:text-emerald-700"
                      title={String(order.id)}
                    >
                      {faDigits(String(order.id))}
                    </Link>
                  </td>
                  <td className="max-w-40 truncate px-4 py-2 text-xs">
                    {order.user?.email ?? dict.admin.dashboard.unknownUser}
                  </td>
                  <td className="px-4 py-2 text-xs font-semibold">
                    {formatToman(order.totalAmount, locale)}
                  </td>
                  <td className="hidden px-4 py-2 sm:table-cell">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                        PAYMENT_STATUS_STYLES[order.paymentStatus] ?? ""
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
