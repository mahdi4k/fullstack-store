"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert, ShoppingCart, Zap } from "lucide-react";
import { api } from "@/lib/api";
import { errorMessage } from "@/lib/error";
import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/components/providers/locale-provider";
import { useCart } from "@/components/providers/cart-provider";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/feedback";
import type { Cart, Product } from "@/lib/types";

/**
 * Quantity stepper + "Add to cart" + "Buy now" for the product detail page.
 * Guests are sent to the login page with a friendly hint instead.
 */
export function AddToCartControls({ product }: { product: Product }) {
  const { user } = useAuth();
  const { apply } = useCart();
  const router = useRouter();
  const { dict, lp } = useI18n();
  const [quantity, setQuantity] = React.useState(1);
  const [added, setAdded] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const soldOut = product.stock <= 0;

  const addToCart = async () => {
    setBusy(true);
    setError(null);
    try {
      const cart = await api<Cart>("/cart/items", {
        method: "POST",
        body: { productId: product.id, quantity },
        token: null,
      });
      apply(cart);
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const buyNow = () => {
    router.push(
      `${lp("/checkout")}?productId=${product.id}&quantity=${quantity}`
    );
  };

  if (!user) {
    return <GuestCta productId={product.id} soldOut={soldOut} />;
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <QuantityStepper
          value={quantity}
          max={product.stock}
          onChange={setQuantity}
        />
        <Button
          onClick={addToCart}
          disabled={busy || soldOut}
          className="flex-1 gap-2"
        >
          {busy ? (
            <Spinner />
          ) : (
            <ShoppingCart className="h-4 w-4" />
          )}
          {soldOut ? dict.products.soldOut : added ? dict.products.added : dict.products.addToCart}
        </Button>
      </div>
      <Button
        variant="outline"
        onClick={buyNow}
        disabled={soldOut}
        className="w-full gap-2"
      >
        <Zap className="h-4 w-4 text-amber-500" />
        {dict.products.buyNow}
      </Button>
      {error ? <ErrorMessage message={error} /> : null}
    </div>
  );
}

function GuestCta({
  productId,
  soldOut,
}: {
  productId: number;
  soldOut: boolean;
}) {
  const { dict, lp } = useI18n();
  return (
    <Button size="lg" asChild disabled={soldOut} className="w-full gap-2">
      <Link href={`${lp("/login")}?next=${encodeURIComponent(lp(`/products/${productId}`))}`}>
        <ShieldAlert className="h-4 w-4" />
        {dict.products.signInToBuy}
      </Link>
    </Button>
  );
}

function QuantityStepper({
  value,
  max,
  onChange,
}: {
  value: number;
  max: number;
  onChange: (value: number) => void;
}) {
  const { dict } = useI18n();
  const cappedMax = Math.max(1, max);
  return (
    <div className="flex h-9 items-center overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-800">
      <StepButton
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        label={dict.products.decreaseAria}
      >
        −
      </StepButton>
      <span className="w-10 text-center text-sm font-medium" aria-live="polite">
        {value}
      </span>
      <StepButton
        onClick={() => onChange(Math.min(cappedMax, value + 1))}
        disabled={value >= cappedMax}
        label={dict.products.increaseAria}
      >
        +
      </StepButton>
    </div>
  );
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
      className="flex h-full w-9 items-center justify-center text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 dark:text-zinc-300 dark:hover:bg-zinc-800"
    >
      {children}
    </button>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return <p className="text-sm text-red-600 dark:text-red-400">{message}</p>;
}
