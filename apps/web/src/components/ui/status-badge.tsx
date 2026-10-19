"use client";

import { cn } from "@/lib/utils";
import {
  ORDER_STATUS_STYLES,
  PAYMENT_STATUS_STYLES,
} from "@/lib/format";
import { useI18n } from "@/components/providers/locale-provider";
import { Badge } from "./badge";

/** Colored badge for order status / payment status values, localized. */
export function StatusBadge({
  status,
  kind = "order",
}: {
  status: string;
  kind?: "order" | "payment";
}) {
  const { dict } = useI18n();
  const styles =
    (kind === "order" ? ORDER_STATUS_STYLES : PAYMENT_STATUS_STYLES)[status] ??
    "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800";
  const label =
    (kind === "order"
      ? dict.status.order[status as keyof typeof dict.status.order]
      : dict.status.payment[status as keyof typeof dict.status.payment]) ?? status.toLowerCase();
  return (
    <Badge variant="outline" className={cn(styles)}>
      {label}
    </Badge>
  );
}
