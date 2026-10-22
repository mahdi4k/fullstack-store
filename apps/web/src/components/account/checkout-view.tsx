"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CreditCard, PackageCheck, Truck, Wrench } from "lucide-react";
import { api } from "@/lib/api";
import { errorMessage } from "@/lib/error";
import { formatToman } from "@/lib/format";
import { useCart } from "@/components/providers/cart-provider";
import { useI18n } from "@/components/providers/locale-provider";
import { plural } from "@/lib/i18n/dictionaries";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/feedback";
import { Textarea } from "@/components/ui/textarea";
import { SummaryRow, type CheckoutItemSummary } from "./checkout-summary-row";
import type { Cart, CouponPreview, Order, Product } from "@/lib/types";

const ADDRESS_KEY = "my-store:lastAddress";
const GARAGE_KEY = "my-store:lastGarage";

/**
 * Checkout for both flows:
 * - cart checkout (`POST /orders/checkout` with no body items)
 * - "Buy now" direct items (passed via `productId`/`quantity`)
 */
export function CheckoutView({
  productId,
  quantity,
}: {
  productId?: number;
  quantity?: number;
}) {
  const buyNow = productId !== undefined;
  const { refresh } = useCart();
  const router = useRouter();
  const { locale, dict, lp } = useI18n();

  const [cart, setCart] = React.useState<Cart | null>(null);
  const [product, setProduct] = React.useState<Product | null>(null);
  const [address, setAddress] = React.useState("");
  // Marketplace checkout steps (delivery → address/garage+slot → payment).
  const [delivery, setDelivery] = React.useState<"shipping" | "garage">("shipping");
  const [garage, setGarage] = React.useState("");
  const [slot, setSlot] = React.useState("");
  const [payment, setPayment] = React.useState<"gateway" | "installments">("gateway");
  // Compose the free-text `shippingAddress` from the chosen steps, since the
  // backend order model stores it as a single string.
  const composedAddress =
    delivery === "garage"
      ? `${dict.checkout.garage}: ${garage.trim() || "-"} — ${dict.checkout.slotLabel}: ${slot.trim() || "-"}`
      : address.trim();
  const finalAddress =
    payment === "installments" ? `${composedAddress} [خرید قسطی · دیجی‌پی]` : composedAddress;
  const [pageBusy, setPageBusy] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Discount code (validated against the API before ordering).
  const [couponInput, setCouponInput] = React.useState("");
  const [coupon, setCoupon] = React.useState<CouponPreview | null>(null);
  const [couponBusy, setCouponBusy] = React.useState(false);
  const [couponError, setCouponError] = React.useState<string | null>(null);

  // Load whichever data source this checkout uses.
  React.useEffect(() => {
    let cancelled = false;
    // Restore the remembered address after mount (avoids hydration mismatch).
    Promise.resolve().then(() => {
      if (!cancelled && typeof window !== "undefined") {
        setAddress(window.localStorage.getItem(ADDRESS_KEY) ?? "");
        setGarage(window.localStorage.getItem(GARAGE_KEY) ?? "");
      }
    });
    (async () => {
      try {
        if (buyNow) {
          const fetched = await api<Product>(`/products/${productId}`);
          if (!cancelled) setProduct(fetched);
        } else {
          const fetched = await api<Cart>("/cart");
          if (!cancelled) setCart(fetched);
        }
      } catch (err) {
        if (!cancelled) setError(errorMessage(err));
      } finally {
        if (!cancelled) setPageBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [buyNow, productId]);

  const items: CheckoutItemSummary[] = buyNow
    ? [
        {
          productId,
          quantity: quantity ?? 1,
          name: product?.name ?? dict.checkout.productN.replace("{n}", String(productId)),
          price: product?.price ?? 0,
          imageUrl: product?.imageUrl,
        },
      ]
    : (cart?.items ?? []).map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        name: item.product.name,
        price: item.product.price,
        imageUrl: item.product.imageUrl,
      }));

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = coupon?.discount ?? 0;
  const total = Math.max(subtotal - discount, 0);

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponBusy(true);
    setCouponError(null);
    try {
      const preview = await api<CouponPreview>("/coupons/validate", {
        method: "POST",
        body: { code: couponInput.trim(), subtotal },
      });
      setCoupon(preview);
    } catch (err) {
      setCoupon(null);
      setCouponError(errorMessage(err));
    } finally {
      setCouponBusy(false);
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponInput("");
    setCouponError(null);
  };

  const placeOrder = async () => {
    setBusy(true);
    setError(null);
    try {
      const body = {
        ...(finalAddress ? { shippingAddress: finalAddress } : {}),
        ...(buyNow ? { items: [{ productId, quantity: quantity ?? 1 }] } : {}),
        ...(coupon ? { couponCode: coupon.code } : {}),
      };
      const order = await api<Order>("/orders/checkout", { method: "POST", body });
      if (typeof window !== "undefined") {
        localStorage.setItem(ADDRESS_KEY, address.trim());
        localStorage.setItem(GARAGE_KEY, garage.trim());
      }
      if (!buyNow) await refresh();
      router.push(`${lp(`/orders/${order.id}`)}?placed=1`);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  const empty = !buyNow && items.length === 0;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-bold tracking-tight">{dict.checkout.title}</h1>

      {pageBusy ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-6 w-6" />
        </div>
      ) : error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      ) : empty ? (
        <p className="mt-8 rounded-xl border border-dashed border-zinc-200 py-14 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          {dict.checkout.emptyCart}
        </p>
      ) : (
        <div className="mt-6 space-y-5">
          {/* Step 1 — delivery method */}
          <fieldset>
            <legend className="mb-2 text-sm font-bold">{dict.checkout.delivery}</legend>
            <div className="grid grid-cols-2 gap-2">
              {(["shipping", "garage"] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setDelivery(method)}
                  className={`rounded-xl border p-3 text-start text-sm transition-colors ${
                    delivery === method
                      ? "border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                      : "border-zinc-200 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                  }`}
                >
                  {method === "shipping" ? (
                    <>
                      <Truck className="mb-1 h-4 w-4" /> {dict.checkout.shipping}
                    </>
                  ) : (
                    <>
                      <Wrench className="mb-1 h-4 w-4" /> {dict.checkout.garage}
                    </>
                  )}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Step 2 — address or garage + time slot */}
          {delivery === "shipping" ? (
            <div className="space-y-1.5">
              <label htmlFor="checkout-address" className="text-sm font-medium">
                {dict.checkout.addressLabel}{" "}
                <span className="font-normal text-zinc-400">{dict.checkout.optional}</span>
              </label>
              <Textarea
                id="checkout-address"
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={dict.checkout.addressPlaceholder}
              />
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="checkout-garage" className="text-sm font-medium">
                  {dict.checkout.garageLabel}
                </label>
                <input
                  id="checkout-garage"
                  value={garage}
                  onChange={(e) => setGarage(e.target.value)}
                  placeholder={dict.checkout.garagePlaceholder}
                  className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="checkout-slot" className="text-sm font-medium">
                  {dict.checkout.slotLabel}
                </label>
                <input
                  id="checkout-slot"
                  value={slot}
                  onChange={(e) => setSlot(e.target.value)}
                  placeholder={dict.checkout.slotPlaceholder}
                  className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>
          )}

          {/* Step 3 — payment method */}
          <fieldset>
            <legend className="mb-2 text-sm font-bold">{dict.checkout.paymentLabel}</legend>
            <div className="grid grid-cols-2 gap-2">
              {(["gateway", "installments"] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPayment(method)}
                  className={`rounded-xl border p-3 text-start text-sm transition-colors ${
                    payment === method
                      ? "border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                      : "border-zinc-200 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                  }`}
                >
                  {method === "gateway" ? dict.checkout.payNow : dict.checkout.payInstallments}
                </button>
              ))}
            </div>
          </fieldset>

          <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
            {items.map((item) => (
              <SummaryRow key={item.productId} item={item} />
            ))}
          </ul>

          {/* Discount code */}
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            {coupon ? (
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  {dict.checkout.coupon.applied.replace("{code}", coupon.code)}{" "}
                  <span className="font-bold">−{formatToman(coupon.discount, locale)}</span>
                </p>
                <button
                  onClick={removeCoupon}
                  className="rounded-full px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  {dict.checkout.coupon.remove}
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      applyCoupon();
                    }
                  }}
                  placeholder={dict.checkout.coupon.placeholder}
                  className="h-10 flex-1 rounded-xl border border-zinc-200 px-3 text-sm uppercase outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                />
                <Button
                  variant="outline"
                  onClick={applyCoupon}
                  disabled={couponBusy || !couponInput.trim()}
                >
                  {couponBusy ? <Spinner /> : dict.checkout.coupon.apply}
                </Button>
              </div>
            )}
            {couponError ? (
              <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">
                {couponError}
              </p>
            ) : null}
          </div>

          <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {plural(items.length, dict.checkout.totalItems, locale)}
              </p>
              {discount > 0 ? (
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  <span className="text-zinc-400 line-through dark:text-zinc-500">
                    {formatToman(subtotal, locale)}
                  </span>{" "}
                  −{formatToman(discount, locale)}
                </p>
              ) : null}
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {formatToman(total, locale)}
              </p>
            </div>
            <Button size="lg" className="gap-2" onClick={placeOrder} disabled={busy}>
              {busy ? <Spinner /> : <CreditCard className="h-4 w-4" />}
              {dict.checkout.placeOrder}
            </Button>
          </div>

          <p className="flex items-center gap-1.5 text-xs text-zinc-400">
            <PackageCheck className="h-3.5 w-3.5" />
            {dict.checkout.stockNote}
          </p>
        </div>
      )}
    </div>
  );
}
