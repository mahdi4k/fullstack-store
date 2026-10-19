"use client";

import * as React from "react";
import { api } from "@/lib/api";
import { errorMessage } from "@/lib/error";
import { useI18n } from "@/components/providers/locale-provider";
import { plural } from "@/lib/i18n/dictionaries";
import { AdminCategoryEditRow } from "./admin-category-edit-row";
import { CategoryRow, CreateForm } from "./category-row";
import type { Category } from "@/lib/types";

/** Create + delete categories against `POST/DELETE /categories`. */
export function AdminCategoriesView() {
  const { locale, dict } = useI18n();
  const t = dict.admin.categories;
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [newName, setNewName] = React.useState("");
  const [newDescription, setNewDescription] = React.useState("");
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const fresh = await api<Category[]>("/categories");
        if (!cancelled) {
          setCategories(fresh);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError(errorMessage(err));
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const reload = React.useCallback(async () => {
    try {
      setCategories(await api<Category[]>("/categories"));
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoaded(true);
    }
  }, []);

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      await api("/categories", {
        method: "POST",
        body: {
          name: newName.trim(),
          ...(newDescription.trim() ? { description: newDescription.trim() } : {}),
        },
      });
      setNewName("");
      setNewDescription("");
      await reload();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (category: Category) => {
    setBusy(true);
    try {
      await api(`/categories/${category.id}`, { method: "DELETE" });
      await reload();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        {loaded ? plural(categories.length, t.count, locale) : dict.misc.loading}
      </p>

      {error ? (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}

      <CreateForm
        busy={busy}
        name={newName}
        description={newDescription}
        onName={setNewName}
        onDescription={setNewDescription}
        onSubmit={create}
      />

      {loaded && categories.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-zinc-200 py-12 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          {t.empty}
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
          {categories.map((category) => (
            <li key={category.id} className="p-4">
              {editingId === category.id ? (
                <AdminCategoryEditRow
                  category={category}
                  busy={busy}
                  onCancel={() => setEditingId(null)}
                  onSave={async (name, description) => {
                    setBusy(true);
                    try {
                      await api(`/categories/${category.id}`, {
                        method: "PATCH",
                        body: { name, description },
                      });
                      setEditingId(null);
                      await reload();
                    } catch (err) {
                      setError(errorMessage(err));
                    } finally {
                      setBusy(false);
                    }
                  }}
                />
              ) : (
                <CategoryRow
                  category={category}
                  busy={busy}
                  onEdit={() => setEditingId(category.id)}
                  onRemove={() => remove(category)}
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
