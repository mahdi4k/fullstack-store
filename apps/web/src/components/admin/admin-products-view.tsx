"use client";

import * as React from "react";
import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { errorMessage } from "@/lib/error";
import { formatMoney } from "@/lib/format";
import { useI18n } from "@/components/providers/locale-provider";
import { fill } from "@/lib/i18n/dictionaries";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/feedback";
import { Th, Td } from "./table-bits";
import type { Paginated, Product } from "@/lib/types";

const PAGE_SIZE = 10;

/** Product table with pagination, edit links and delete. */
export function AdminProductsView() {
  const { locale, dict, lp } = useI18n();
  const t = dict.admin.products;
  const [page, setPage] = React.useState(1);
  const [data, setData] = React.useState<Paginated<Product> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [busyId, setBusyId] = React.useState<number | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const fresh = await api<Paginated<Product>>(
          `/products?page=${page}&limit=${PAGE_SIZE}`
        );
        if (!cancelled) setData(fresh);
      } catch (err) {
        if (!cancelled) setError(errorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page]);

  const remove = async (product: Product) => {
    setBusyId(product.id);
    setError(null);
    try {
      await api(`/products/${product.id}`, { method: "DELETE" });
      setData(null);
      setLoading(true);
      const fresh = await api<Paginated<Product>>(
        `/products?page=${page}&limit=${PAGE_SIZE}`
      );
      setData(fresh);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const meta = data?.meta;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {meta ? fill(t.total, { n: meta.total }, locale) : dict.misc.loading}
          </p>
        </div>
        <Button asChild size="sm" className="gap-1.5">
          <Link href={lp("/admin/products/new")}>
            <Plus className="h-4 w-4" /> {t.new}
          </Link>
        </Button>
      </div>

      {error ? (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner className="h-6 w-6" />
        </div>
      ) : data && data.data.length === 0 ? (
        <EmptyState
          icon={<Plus className="h-6 w-6" />}
          title={t.emptyTitle}
          description={t.emptyDescription}
          className="mt-6"
        >
          <Button asChild>
            <Link href={lp("/admin/products/new")}>{t.create}</Link>
          </Button>
        </EmptyState>
      ) : data ? (
        <div className="mt-6 overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-start text-xs uppercase tracking-wide text-zinc-400 dark:border-zinc-800">
                <Th>{t.thId}</Th>
                <Th>{t.thName}</Th>
                <Th>{t.thCategory}</Th>
                <Th>{t.thPrice}</Th>
                <Th>{t.thStock}</Th>
                <Th>{t.thReviews}</Th>
                <Th className="text-end">{t.thActions}</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {data.data.map((product) => (
                <tr key={product.id}>
                  <Td>{product.id}</Td>
                  <Td className="max-w-60 truncate font-medium dark:text-zinc-100">
                    {product.name}
                  </Td>
                  <Td>{product.category?.name ?? "—"}</Td>
                  <Td className="font-medium">{formatMoney(product.price, locale)}</Td>
                  <Td>
                    {product.stock > 0 ? (
                      product.stock
                    ) : (
                      <span className="text-red-500">0</span>
                    )}
                  </Td>
                  <Td>{product._count?.reviews ?? 0}</Td>
                  <Td>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild aria-label={fill(t.editAria, { name: product.name }, locale)}>
                        <Link href={lp(`/admin/products/${product.id}`)}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={fill(t.deleteAria, { name: product.name }, locale)}
                        disabled={busyId === product.id}
                        onClick={() => remove(product)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {meta && meta.totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-center gap-3 text-sm">
          <Button
            variant="outline"
            size="sm"
            disabled={meta.page <= 1}
            onClick={() => setPage(page - 1)}
          >
            {t.previous}
          </Button>
          <span className="text-zinc-500">
            {fill(dict.orders.pageOf, { a: meta.page, b: meta.totalPages }, locale)}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={meta.page >= meta.totalPages}
            onClick={() => setPage(page + 1)}
          >
            {t.next}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
