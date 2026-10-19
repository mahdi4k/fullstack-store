"use client";

import * as React from "react";
import { X } from "lucide-react";
import { useI18n } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Category } from "@/lib/types";

/** Inline edit form for one category (`PATCH /categories/:id`). */
export function AdminCategoryEditRow({
  category,
  busy,
  onCancel,
  onSave,
}: {
  category: Category;
  busy: boolean;
  onCancel: () => void;
  onSave: (name: string, description: string) => void;
}) {
  const { dict } = useI18n();
  const t = dict.admin.categories;
  const [name, setName] = React.useState(category.name);
  const [description, setDescription] = React.useState(
    category.description ?? ""
  );

  const save = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave(trimmed, description.trim());
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <div className="flex-1 space-y-1">
        <Label htmlFor={`edit-name-${category.id}`}>{t.name}</Label>
        <Input
          id={`edit-name-${category.id}`}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="flex-1 space-y-1">
        <Label htmlFor={`edit-description-${category.id}`}>{t.description}</Label>
        <Input
          id={`edit-description-${category.id}`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Button size="sm" disabled={busy || !name.trim()} onClick={save}>
          {t.save}
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel} className="gap-1">
          <X className="h-3.5 w-3.5" /> {t.cancel}
        </Button>
      </div>
    </div>
  );
}
