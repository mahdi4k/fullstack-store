"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useI18n } from "@/components/providers/locale-provider";
import { fill, plural } from "@/lib/i18n/dictionaries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Category } from "@/lib/types";

/** Create-category form at the top of the admin screen. */

export function CreateForm({
  busy,
  name,
  description,
  onName,
  onDescription,
  onSubmit,
}: {
  busy: boolean;
  name: string;
  description: string;
  onName: (value: string) => void;
  onDescription: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
}) {
  const { dict } = useI18n();
  const t = dict.admin.categories;
  return (
    <form
      onSubmit={onSubmit}
      className="mt-6 flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-end"
    >
      <div className="flex-1 space-y-1.5">
        <Label htmlFor="new-category-name">{t.newNameLabel}</Label>
        <Input
          id="new-category-name"
          required
          value={name}
          onChange={(e) => onName(e.target.value)}
          placeholder={t.newNamePlaceholder}
        />
      </div>
      <div className="flex-1 space-y-1.5">
        <Label htmlFor="new-category-description">{t.newDescriptionLabel}</Label>
        <Input
          id="new-category-description"
          value={description}
          onChange={(e) => onDescription(e.target.value)}
          placeholder={t.newDescriptionPlaceholder}
        />
      </div>
      <Button type="submit" size="sm" disabled={busy} className="gap-1.5">
        <Plus className="h-4 w-4" />
        {t.add}
      </Button>
    </form>
  );
}

/** Read-only category row with edit/delete actions. */
export function CategoryRow({
  category,
  busy,
  onEdit,
  onRemove,
}: {
  category: Category;
  busy: boolean;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const { locale, dict } = useI18n();
  const t = dict.admin.categories;
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="font-medium text-zinc-900 dark:text-zinc-100">
          {category.name}
          <span className="ms-2 text-xs font-normal text-zinc-400">
            {plural(category._count?.products ?? 0, t.productsCount, locale)}
          </span>
        </p>
        {category.description ? (
          <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">
            {category.description}
          </p>
        ) : null}
      </div>
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          aria-label={fill(t.editAria, { name: category.name }, locale)}
          onClick={onEdit}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label={fill(t.deleteAria, { name: category.name }, locale)}
          disabled={busy}
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    </div>
  );
}
