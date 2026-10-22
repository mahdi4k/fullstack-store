"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, PackageSearch } from "lucide-react";
import { api } from "@/lib/api";
import { errorMessage } from "@/lib/error";
import { formatDateTime, formatToman } from "@/lib/format";
import { useI18n } from "@/components/providers/locale-provider";
import { fill, plural } from "@/lib/i18n/dictionaries";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductImage } from "@/components/store/product-image";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Order, Paginated } from "@/lib/types";

/** Paged order history with a compact card per order. */
export function OrdersList({ page }: { page: number }) {
  const router = useRouter();
  const { locale, dict, lp } = useI18n();
  const [result, setResult] = React.useState<Paginated<Order> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const fresh = await api<Paginated<Order>>(`/orders?page=${page}&limit=10`);
        if (!cancelled) setResult(fresh);
      } catch (err) {
        if (!cancelled) setError(errorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page]);

  const goPage = (next: number) => router.push(`${lp("/orders")}?page=${next}`);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100" />
      </div>
    );
  }

  if (error) {
    return <p className="mx-auto max-w-3xl px-6 py-10 text-sm text-red-600">{error}</p>;
  }

  const orders = result?.data ?? [];

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <EmptyState
          icon={<PackageSearch className="h-6 w-6" />}
          title={dict.orders.emptyTitle}
          description={dict.orders.emptyDescription}
        >
          <Button asChild>
            <Link href={lp("/products")}>{dict.orders.emptyCta}</Link>
          </Button>
        </EmptyState>
      </div>
    );
  }

  const meta = result!.meta;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-bold tracking-tight">{dict.orders.title}</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        {plural(meta.total, dict.orders.total, locale)}
      </p>

      <ul className="mt-6 space-y-4">
        {orders.map((order) => (
          <li key={order.id}>
            <Link
              href={lp(`/orders/${order.id}`)}
              className="block rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">
                    {fill(dict.orders.orderN, { n: order.id }, locale)}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {formatDateTime(order.createdAt, locale)} ·{" "}
                    {plural(order.items.length, dict.cart.items, locale)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={order.status} />
                  <StatusBadge kind="payment" status={order.paymentStatus} />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-4">
                <OrderThumbnails order={order} />
                <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  {formatToman(order.totalAmount, locale)}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {meta.totalPages > 1 ? (
        <div className="mt-8 flex items-center justify-center gap-4">
          <PagerButton
            icon={<ChevronLeft className="h-4 w-4 rtl:-scale-x-100" />}
            disabled={meta.page <= 1}
            onClick={() => goPage(meta.page - 1)}
            label={dict.orders.previous}
          />
          <span className="text-sm text-zinc-500">
            {fill(dict.orders.pageOf, { a: meta.page, b: meta.totalPages }, locale)}
          </span>
          <PagerButton
            icon={<ChevronRight className="h-4 w-4 rtl:-scale-x-100" />}
            disabled={meta.page >= meta.totalPages}
            onClick={() => goPage(meta.page + 1)}
            label={dict.orders.next}
          />
        </div>
      ) : null}
    </div>
  );
}

function OrderThumbnails({ order }: { order: Order }) {
  return (
    <div className="flex -space-x-2 rtl:space-x-reverse">
      {order.items.slice(0, 4).map((item) => (
        <div
          key={item.id}
          className="h-10 w-10 overflow-hidden rounded-full border border-white bg-zinc-100 dark:border-zinc-900 dark:bg-zinc-800"
        >
          <ProductImage
            src={item.product?.imageUrl}
            alt={item.product?.name ?? ""}
            className="h-full w-full"
          />
        </div>
      ))}
      {order.items.length > 4 ? (
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white bg-zinc-200 text-xs font-medium text-zinc-600 dark:border-zinc-900 dark:bg-zinc-700 dark:text-zinc-300">
          +{order.items.length - 4}
        </div>
      ) : null}
    </div>
  );
}

function PagerButton({
  icon,
  disabled,
  onClick,
  label,
}: {
  icon: React.ReactNode;
  disabled: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <Button variant="outline" size="sm" onClick={onClick} disabled={disabled} aria-label={label}>
      {icon}
    </Button>
  );
}
