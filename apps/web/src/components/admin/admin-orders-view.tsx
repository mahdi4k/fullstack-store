"use client";

import * as React from "react";
import { api } from "@/lib/api";
import { errorMessage } from "@/lib/error";
import { useI18n } from "@/components/providers/locale-provider";
import { fill } from "@/lib/i18n/dictionaries";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/feedback";
import { OrdersTable } from "./admin-orders-table";
import type { Order, OrderStatus, Paginated, PaymentStatus } from "@/lib/types";

const FILTERS: OrderStatus[] = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

/** All orders with a status filter and inline status management. */
export function AdminOrdersView() {
  const { locale, dict } = useI18n();
  const t = dict.admin.orders;
  const [page, setPage] = React.useState(1);
  const [statusFilter, setStatusFilter] = React.useState("");
  const [data, setData] = React.useState<Paginated<Order> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [savingId, setSavingId] = React.useState<number | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const fresh = await api<Paginated<Order>>(
          `/orders/admin/all?page=${page}&limit=10${statusFilter ? `&status=${statusFilter}` : ""}`
        );
        if (!cancelled) setData(fresh);
      } catch (err) {
        if (!cancelled) setError(errorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page, statusFilter]);

  const updateStatus = async (
    order: Order,
    status: OrderStatus,
    paymentStatus?: PaymentStatus
  ) => {
    setSavingId(order.id);
    setError(null);
    try {
      const updated = await api<Order>(`/orders/admin/${order.id}/status`, {
        method: "PATCH",
        body: { status, ...(paymentStatus ? { paymentStatus } : {}) },
      });
      setData((prev) =>
        prev
          ? { ...prev, data: prev.data.map((o) => (o.id === updated.id ? updated : o)) }
          : prev
      );
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {data?.meta ? fill(t.total, { n: data.meta.total }, locale) : dict.misc.loading}
          </p>
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => {
            setPage(1);
            setStatusFilter(e.target.value);
          }}
          className="w-44"
          aria-label={t.filterAria}
        >
          <option value="">{t.allStatuses}</option>
          {FILTERS.map((status) => (
            <option key={status} value={status}>
              {dict.status.order[status]}
            </option>
          ))}
        </Select>
      </div>

      {error ? (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner className="h-6 w-6" />
        </div>
      ) : data && data.data.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-zinc-200 py-12 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          {statusFilter ? t.emptyFiltered : t.empty}
        </p>
      ) : (
        <OrdersTable
          orders={data?.data ?? []}
          savingId={savingId}
          onUpdate={updateStatus}
        />
      )}

      <OrdersPager meta={data?.meta} page={page} onGo={setPage} />
    </div>
  );
}

function OrdersPager({
  meta,
  page,
  onGo,
}: {
  meta?: { page: number; totalPages: number };
  page: number;
  onGo: (page: number) => void;
}) {
  const { locale, dict } = useI18n();
  if (!meta || meta.totalPages <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-center gap-3 text-sm">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onGo(page - 1)}>
        {dict.admin.orders.previous}
      </Button>
      <span className="text-zinc-500">
        {fill(dict.orders.pageOf, { a: meta.page, b: meta.totalPages }, locale)}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={meta.page >= meta.totalPages}
        onClick={() => onGo(page + 1)}
      >
        {dict.admin.orders.next}
      </Button>
    </div>
  );
}
