"use client";

import { formatDateTime, formatMoney } from "@/lib/format";
import { useI18n } from "@/components/providers/locale-provider";
import { plural } from "@/lib/i18n/dictionaries";
import { StatusBadge } from "@/components/ui/status-badge";
import { OrderControls } from "./order-controls";
import { Th, Td } from "./table-bits";
import type { Order, OrderStatus, PaymentStatus } from "@/lib/types";

/** Admin table listing orders with inline status update controls. */
export function OrdersTable({
  orders,
  savingId,
  onUpdate,
}: {
  orders: Order[];
  savingId: number | null;
  onUpdate: (
    order: Order,
    status: OrderStatus,
    paymentStatus?: PaymentStatus
  ) => Promise<void>;
}) {
  const { locale, dict } = useI18n();
  const t = dict.admin.orders;
  return (
    <div className="mt-5 overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-400 dark:border-zinc-800">
            <Th>{t.thOrder}</Th>
            <Th>{t.thCustomer}</Th>
            <Th>{t.thDate}</Th>
            <Th>{t.thTotal}</Th>
            <Th>{t.thStatus}</Th>
            <Th className="text-end">{t.thUpdate}</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {orders.map((order) => (
            <tr key={order.id}>
              <Td className="font-medium dark:text-zinc-100">#{order.id}</Td>
              <Td>
                {order.user?.name ?? order.user?.email ?? "—"}
                <span className="ms-2 text-xs text-zinc-400">
                  {plural(order.items.length, t.itemsCount, locale)}
                </span>
              </Td>
              <Td>{formatDateTime(order.createdAt, locale)}</Td>
              <Td className="font-medium">{formatMoney(order.totalAmount, locale)}</Td>
              <Td>
                <StatusBadge status={order.status} />
                <span className="ms-1.5">
                  <StatusBadge kind="payment" status={order.paymentStatus} />
                </span>
              </Td>
              <Td>
                <OrderControls
                  order={order}
                  busy={savingId === order.id}
                  onStatus={(status) => onUpdate(order, status)}
                  // Keep the order status unchanged; only payment moves.
                  onPayment={(payment) => onUpdate(order, order.status, payment)}
                />
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
