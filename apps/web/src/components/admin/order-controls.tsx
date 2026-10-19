"use client";

import { Spinner } from "@/components/ui/feedback";
import { Select } from "@/components/ui/select";
import { useI18n } from "@/components/providers/locale-provider";
import type { Order, OrderStatus, PaymentStatus } from "@/lib/types";

const STATUSES: OrderStatus[] = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const PAYMENTS: PaymentStatus[] = ["PENDING", "PAID", "FAILED", "REFUNDED"];

/** Inline status + payment selects for one admin order row. */
export function OrderControls({
  order,
  busy,
  onStatus,
  onPayment,
}: {
  order: Order;
  busy: boolean;
  onStatus: (status: OrderStatus) => void;
  onPayment: (payment: PaymentStatus) => void;
}) {
  const { dict } = useI18n();
  const t = dict.admin.orders;
  return (
    <div className="flex justify-end gap-1.5">
      {busy ? <Spinner className="h-8 self-center" /> : null}
      <Select
        value={order.status}
        onChange={(e) => onStatus(e.target.value as OrderStatus)}
        className="w-32 text-xs"
        aria-label={t.statusAria}
      >
        {STATUSES.map((status) => (
          <option key={status} value={status}>
            {dict.status.order[status]}
          </option>
        ))}
      </Select>
      <Select
        value={order.paymentStatus}
        onChange={(e) => onPayment(e.target.value as PaymentStatus)}
        className="w-28 text-xs"
        aria-label={t.paymentAria}
      >
        {PAYMENTS.map((payment) => (
          <option key={payment} value={payment}>
            {dict.status.payment[payment]}
          </option>
        ))}
      </Select>
    </div>
  );
}

export { STATUSES, PAYMENTS };
