"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle, PackageOpen, Box } from "lucide-react";
import { api } from "@/lib/api";
import { errorMessage } from "@/lib/error";
import { formatDateTime, formatToman } from "@/lib/format";
import { useI18n } from "@/components/providers/locale-provider";
import { fill, plural } from "@/lib/i18n/dictionaries";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/store/product-image";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Order } from "@/lib/types";

/** Full order view with a timeline of statuses and cancel for PENDING orders. */
export function OrderDetailView({
  orderId,
  justPlaced,
}: {
  orderId: number;
  justPlaced: boolean;
}) {
  const { locale, dict, lp } = useI18n();
  const [order, setOrder] = React.useState<Order | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [cancelBusy, setCancelBusy] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      setOrder(await api<Order>(`/orders/${orderId}`));
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const fresh = await api<Order>(`/orders/${orderId}`);
        if (!cancelled) setOrder(fresh);
      } catch (err) {
        if (!cancelled) setError(errorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const cancel = async () => {
    setCancelBusy(true);
    try {
      await api(`/orders/${orderId}/cancel`, { method: "PATCH" });
      await load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setCancelBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href={lp("/orders")}
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        <ArrowLeft className="h-3.5 w-3.5 rtl:-scale-x-100" /> {dict.order.allOrders}
      </Link>

      {justPlaced ? (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4" />
          {dict.order.thanks}
        </div>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-20">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100" />
        </div>
      ) : error ? (
        <div className="mt-8 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          <XCircle className="h-4 w-4" /> {error}
        </div>
      ) : order ? (
        <DVContent order={order} cancelBusy={cancelBusy} onCancel={cancel} />
      ) : null}
    </div>
  );
}

function DVContent({
  order,
  cancelBusy,
  onCancel,
}: {
  order: Order;
  cancelBusy: boolean;
  onCancel: () => void;
}) {
  const { locale, dict, lp } = useI18n();
  return (
    <>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {fill(dict.order.titleN, { n: order.id }, locale)}
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {fill(dict.order.placedAt, { date: formatDateTime(order.createdAt, locale) }, locale)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={order.status} />
          <StatusBadge kind="payment" status={order.paymentStatus} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <InfoBox icon={<Box className="h-4 w-4" />} label={dict.order.total}>
          {formatToman(order.totalAmount, locale)}
        </InfoBox>
        <InfoBox icon={<PackageOpen className="h-4 w-4" />} label={dict.order.address}>
          {order.shippingAddress || "—"}
        </InfoBox>
        <InfoBox icon={<Box className="h-4 w-4" />} label={dict.order.items}>
          {order.items.length}
        </InfoBox>
      </div>

      <ul className="mt-6 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
        {order.items.map((item) => (
          <li key={item.id} className="flex items-center gap-3 p-4">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-zinc-50 dark:bg-zinc-950">
              <ProductImage
                src={item.product?.imageUrl}
                alt={item.product?.name ?? fill(dict.order.productAlt, { n: item.productId }, locale)}
                className="h-full w-full"
              />
            </div>
            <div className="min-w-0 flex-1">
              <Link
                href={lp(`/products/${item.productId}`)}
                className="line-clamp-1 font-medium hover:underline dark:text-zinc-100"
              >
                {item.product?.name ?? fill(dict.order.productN, { n: item.productId }, locale)}
              </Link>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {item.quantity} × {formatToman(item.price, locale)}
              </p>
            </div>
            <p className="font-semibold dark:text-zinc-100">
              {formatToman(item.price * item.quantity, locale)}
            </p>
          </li>
        ))}
      </ul>

      {order.status === "PENDING" ? (
        <div className="mt-6 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/30">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            {dict.order.pendingNote}
          </p>
          <Button variant="destructive" size="sm" onClick={onCancel} disabled={cancelBusy}>
            {cancelBusy ? dict.order.cancelling : dict.order.cancel}
          </Button>
        </div>
      ) : null}
    </>
  );
}

function InfoBox({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-zinc-400">
        {icon} {label}
      </p>
      <p className="mt-2 font-semibold text-zinc-900 dark:text-zinc-100">{children}</p>
    </div>
  );
}
