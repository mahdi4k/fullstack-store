"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { api } from "@/lib/api";
import { errorMessage } from "@/lib/error";
import { useI18n } from "@/components/providers/locale-provider";
import { fill } from "@/lib/i18n/dictionaries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/feedback";
import { Textarea } from "@/components/ui/textarea";
import type { Category, ProductDetail } from "@/lib/types";

interface FormState {
  name: string;
  description: string;
  price: string;
  stock: string;
  imageUrl: string;
  categoryId: string;
  discountPercent: string;
  compatibleVehicles: string;
}

/** Create/edit product form (`POST /products` or `PATCH /products/:id`). */
export function ProductForm({
  product,
  productId,
}: {
  product?: ProductDetail | null;
  productId?: number;
}) {
  const editing = productId !== undefined;
  const router = useRouter();
  const { locale, dict, lp } = useI18n();
  const t = dict.admin.productForm;
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [form, setForm] = React.useState<FormState>({
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product ? String(product.price) : "",
    stock: product ? String(product.stock) : "0",
    imageUrl: product?.imageUrl ?? "",
    categoryId: product?.categoryId ? String(product.categoryId) : "",
    discountPercent: product ? String(product.discountPercent ?? 0) : "0",
    compatibleVehicles: (product?.compatibleVehicles ?? []).join("، "),
  });
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  // Editing mode that failed to load its product renders an error card.
  const [notFound] = React.useState(editing && !product);

  React.useEffect(() => {
    (async () => {
      try {
        setCategories(await api<Category[]>("/categories"));
      } catch {
        // The dropdown will be empty; product can still be saved without one.
      }
    })();
  }, []);

  const set = (key: keyof FormState) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const body = {
        name: form.name.trim(),
        ...(form.description.trim() ? { description: form.description.trim() } : {}),
        price: Number(form.price),
        stock: Number(form.stock || 0),
        discountPercent: Math.min(Math.max(Number(form.discountPercent || 0), 0), 100),
        compatibleVehicles: form.compatibleVehicles
          .split(/[،,]|\s+/)
          .map((entry) => entry.trim())
          .filter(Boolean),
        ...(form.imageUrl.trim() ? { imageUrl: form.imageUrl.trim() } : {}),
        ...(form.categoryId ? { categoryId: Number(form.categoryId) } : {}),
      };
      if (editing) {
        await api(`/products/${productId}`, { method: "PATCH", body });
      } else {
        await api("/products", { method: "POST", body });
      }
      router.push(lp("/admin/products"));
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  if (notFound) {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
        {fill(t.notFound, { n: productId ?? 0 }, locale)}
      </p>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="space-y-1.5">
        <Label htmlFor="product-name">{t.name}</Label>
        <Input
          id="product-name"
          required
          value={form.name}
          onChange={(e) => set("name")(e.target.value)}
          placeholder={t.namePlaceholder}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="product-description">{t.description}</Label>
        <Textarea
          id="product-description"
          rows={4}
          value={form.description}
          onChange={(e) => set("description")(e.target.value)}
          placeholder={t.descriptionPlaceholder}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="product-price">{t.price}</Label>
          <Input
            id="product-price"
            type="number"
            min="0.01"
            step="0.01"
            required
            value={form.price}
            onChange={(e) => set("price")(e.target.value)}
            placeholder="199.99"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="product-stock">{t.stock}</Label>
          <Input
            id="product-stock"
            type="number"
            min="0"
            step="1"
            value={form.stock}
            onChange={(e) => set("stock")(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="product-discount">{t.discountPercent}</Label>
          <Input
            id="product-discount"
            type="number"
            min="0"
            max="100"
            step="1"
            value={form.discountPercent}
            onChange={(e) => set("discountPercent")(e.target.value)}
            placeholder="0"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="product-vehicles">{t.compatibleVehicles}</Label>
        <Input
          id="product-vehicles"
          value={form.compatibleVehicles}
          onChange={(e) => set("compatibleVehicles")(e.target.value)}
          placeholder={t.compatibleVehiclesHint}
        />
        <p className="text-xs text-zinc-400">{t.compatibleVehiclesHelp}</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="product-category">{t.category}</Label>
        <Select
          id="product-category"
          value={form.categoryId}
          onChange={(e) => set("categoryId")(e.target.value)}
        >
          <option value="">{t.noCategory}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="product-image">{t.image}</Label>
        <Input
          id="product-image"
          type="url"
          value={form.imageUrl}
          onChange={(e) => set("imageUrl")(e.target.value)}
          placeholder="https://example.com/images/headphones.jpg"
        />
      </div>

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}

      <div className="flex items-center justify-between pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={busy}
        >
          {t.cancel}
        </Button>
        <Button type="submit" disabled={busy} className="gap-2">
          {busy ? <Spinner /> : <Save className="h-4 w-4" />}
          {editing ? t.saveChanges : t.create}
        </Button>
      </div>
    </form>
  );
}
