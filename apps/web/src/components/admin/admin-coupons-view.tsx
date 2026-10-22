"use client";

import * as React from "react";
import { Plus, Ticket, Trash2, X } from "lucide-react";
import { api } from "@/lib/api";
import { errorMessage } from "@/lib/error";
import { formatToman, formatNumber, formatDateTime } from "@/lib/format";
import { useI18n } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/feedback";
import type { Coupon, CouponType } from "@/lib/types";

/**
 * Admin coupons: list, create/edit (percent or fixed, expiry, usage
 * limits), activate/deactivate and delete.
 */
export function AdminCouponsView() {
  const { locale, dict } = useI18n();
  const t = dict.admin.coupons;
  const [coupons, setCoupons] = React.useState<Coupon[] | null>(null);
  const [editor, setEditor] = React.useState<Coupon | "new" | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      const data = await api<Coupon[]>("/coupons");
      setCoupons(data);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function remove(id: number) {
    if (!window.confirm(t.confirmDelete)) return;
    setBusy(true);
    try {
      await api(`/coupons/${id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(coupon: Coupon) {
    setBusy(true);
    try {
      await api(`/coupons/${coupon.id}`, {
        method: "PATCH",
        body: { active: !coupon.active },
      });
      await load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">{t.title}</h1>
        <Button size="sm" className="gap-1.5" onClick={() => setEditor("new")}>
          <Plus className="h-4 w-4" />
          {t.create}
        </Button>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-zinc-100 text-xs text-zinc-500 dark:border-zinc-800">
              <th className="px-4 py-2 text-start font-medium">{t.code}</th>
              <th className="px-4 py-2 text-start font-medium">{t.discount}</th>
              <th className="px-4 py-2 text-start font-medium">{t.usage}</th>
              <th className="px-4 py-2 text-start font-medium">{t.expires}</th>
              <th className="px-4 py-2 text-start font-medium">{t.status}</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {coupons === null ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-zinc-400">
                  <Spinner />
                </td>
              </tr>
            ) : coupons.length === 0 ? (
              <tr>
                <td colSpan={6} className="flex items-center justify-center gap-2 px-4 py-12 text-zinc-400">
                  <Ticket className="h-4 w-4" />
                  {t.empty}
                </td>
              </tr>
            ) : (
              coupons.map((coupon) => (
                <tr key={coupon.id} className="text-zinc-800 dark:text-zinc-200">
                  <td className="px-4 py-3 font-mono text-xs font-bold tracking-wider">
                    {coupon.code}
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold">
                    {coupon.type === "PERCENT"
                      ? formatNumber(coupon.value, locale) + "٪"
                      : formatToman(coupon.value, locale)}
                  </td>
                  <td className="px-4 py-3 text-xs" dir="ltr">
                    {formatNumber(coupon.usedCount, locale)}
                    {coupon.usageLimit ? ` / ${formatNumber(coupon.usageLimit, locale)}` : " ∞"}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500">
                    {coupon.expiresAt ? formatDateTime(coupon.expiresAt, locale) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      disabled={busy}
                      onClick={() => toggleActive(coupon)}
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition-colors ${
                        coupon.active
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                          : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                      }`}
                    >
                      {coupon.active ? t.active : t.inactive}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-end">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditor(coupon)}
                      >
                        {t.edit}
                      </Button>
                      <button
                        disabled={busy}
                        onClick={() => remove(coupon.id)}
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-40 dark:hover:bg-red-950/40"
                        aria-label={t.delete}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editor ? (
        <CouponEditor
          coupon={editor === "new" ? null : editor}
          onClose={() => setEditor(null)}
          saved={async () => {
            setEditor(null);
            await load();
          }}
        />
      ) : null}
    </div>
  );
}

/** Create/edit dialog for one coupon. */
function CouponEditor({
  coupon,
  onClose,
  saved,
}: {
  coupon: Coupon | null;
  onClose: () => void;
  saved: () => Promise<void>;
}) {
  const { dict } = useI18n();
  const t = dict.admin.coupons;
  const [form, setForm] = React.useState({
    code: coupon?.code ?? "",
    type: (coupon?.type ?? "PERCENT") as CouponType,
    value: coupon?.value?.toString() ?? "10",
    minSubtotal: coupon?.minSubtotal?.toString() ?? "",
    maxDiscount: coupon?.maxDiscount?.toString() ?? "",
    expiresAt: coupon?.expiresAt ? coupon.expiresAt.slice(0, 10) : "",
    usageLimit: coupon?.usageLimit?.toString() ?? "",
  });
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const isNew = coupon === null;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const body = {
      code: form.code.trim().toUpperCase(),
      type: form.type,
      value: Number(form.value),
      minSubtotal: form.minSubtotal ? Number(form.minSubtotal) : 0,
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
    };
    try {
      if (isNew) {
        await api("/coupons", { method: "POST", body });
      } else {
        await api(`/coupons/${coupon.id}`, { method: "PATCH", body });
      }
      await saved();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">
            {isNew ? t.create : t.editTitle.replace("{code}", coupon.code)}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label={t.cancel}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="coupon-code">{t.code}</Label>
              <Input
                id="coupon-code"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="NOWRUZ1400"
                disabled={!isNew}
                required
                minLength={3}
                maxLength={40}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="coupon-type">{t.type}</Label>
              <select
                id="coupon-type"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as CouponType })}
                className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <option value="PERCENT">{t.percent}</option>
                <option value="FIXED">{t.fixed}</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="coupon-value">
              {form.type === "PERCENT" ? t.valuePercent : t.valueFixed}
            </Label>
            <Input
              id="coupon-value"
              type="number"
              min={form.type === "PERCENT" ? 1 : 0}
              max={form.type === "PERCENT" ? 100 : undefined}
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="coupon-min">{t.minSubtotal}</Label>
              <Input
                id="coupon-min"
                type="number"
                min={0}
                value={form.minSubtotal}
                onChange={(e) => setForm({ ...form, minSubtotal: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="coupon-max">{t.maxDiscount}</Label>
              <Input
                id="coupon-max"
                type="number"
                min={0}
                value={form.maxDiscount}
                onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                disabled={form.type === "FIXED"}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="coupon-expiry">{t.expires}</Label>
              <Input
                id="coupon-expiry"
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="coupon-limit">{t.usageLimit}</Label>
              <Input
                id="coupon-limit"
                type="number"
                min={1}
                value={form.usageLimit}
                onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                placeholder="∞"
              />
            </div>
          </div>

          {error ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </p>
          ) : null}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
              {t.cancel}
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? <Spinner /> : t.save}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
