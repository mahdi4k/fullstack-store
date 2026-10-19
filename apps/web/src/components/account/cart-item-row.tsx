"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { formatMoney } from "@/lib/format";
import { useI18n } from "@/components/providers/locale-provider";
import { ProductImage } from "@/components/store/product-image";
import type { CartItem } from "@/lib/types";

/** One line of the cart list: thumbnail, title, qty stepper, line total. */
export function CartItemRow({
  item,
  busy,
  onUpdateQuantity,
  onRemove,
}: {
  item: CartItem;
  busy: boolean;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}) {
  const { locale, dict, lp } = useI18n();
  const maxStock = Math.max(1, item.product.stock);

  return (
    <li className={`flex items-center gap-4 p-4 ${busy ? "opacity-50" : ""}`}>
      <Link
        href={lp(`/products/${item.productId}`)}
        className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-zinc-50 dark:bg-zinc-950"
      >
        <ProductImage
          src={item.product.imageUrl}
          alt={item.product.name}
          className="h-full w-full"
        />
      </Link>

      <div className="min-w-0 flex-1">
        <Link
          href={lp(`/products/${item.productId}`)}
          className="line-clamp-1 font-medium text-zinc-900 hover:underline dark:text-zinc-100"
        >
          {item.product.name}
        </Link>
        <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
          {formatMoney(item.product.price, locale)} {dict.cart.each}
        </p>
      </div>

      <div className="flex items-center rounded-md border border-zinc-200 dark:border-zinc-800">
        <StepButton
          onClick={() => onUpdateQuantity(item.quantity - 1)}
          disabled={busy || item.quantity <= 1}
          label={dict.cart.decreaseAria}
        >
          <Minus className="h-3.5 w-3.5" />
        </StepButton>
        <span className="w-9 text-center text-sm font-medium" aria-live="polite">
          {item.quantity}
        </span>
        <StepButton
          onClick={() => onUpdateQuantity(item.quantity + 1)}
          disabled={busy || item.quantity >= maxStock}
          label={dict.cart.increaseAria}
        >
          <Plus className="h-3.5 w-3.5" />
        </StepButton>
      </div>

      <p className="w-20 text-end font-semibold text-zinc-900 dark:text-zinc-50">
        {formatMoney(item.total, locale)}
      </p>

      <button
        type="button"
        onClick={onRemove}
        disabled={busy}
        aria-label={pluralFill(dict.cart.removeAria, item.product.name)}
        className="rounded-md p-2 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  );
}

function pluralFill(template: string, name: string) {
  return template.replace("{name}", name);
}

function StepButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 dark:text-zinc-300 dark:hover:bg-zinc-800"
    >
      {children}
    </button>
  );
}
