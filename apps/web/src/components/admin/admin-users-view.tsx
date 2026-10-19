"use client";

import * as React from "react";
import { api } from "@/lib/api";
import { errorMessage } from "@/lib/error";
import { formatDate } from "@/lib/format";
import { useI18n } from "@/components/providers/locale-provider";
import { fill, plural } from "@/lib/i18n/dictionaries";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/feedback";
import { Th, Td } from "./table-bits";
import type { AdminUser, Paginated, Role } from "@/lib/types";

const ROLES: Role[] = ["CUSTOMER", "ADMIN"];
const PAGE_SIZE = 10;

/** User list with pagination and inline role switching. */
export function AdminUsersView() {
  const { locale, dict } = useI18n();
  const t = dict.admin.users;
  const [page, setPage] = React.useState(1);
  const [data, setData] = React.useState<Paginated<AdminUser> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [savingId, setSavingId] = React.useState<number | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const fresh = await api<Paginated<AdminUser>>(`/users?page=${page}&limit=${PAGE_SIZE}`);
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

  const updateRole = async (user: AdminUser, role: Role) => {
    setSavingId(user.id);
    setError(null);
    try {
      // The role endpoint returns the user without `_count`,
      // so we apply the change locally to keep the row intact.
      await api(`/users/${user.id}/role`, { method: "PATCH", body: { role } });
      setData((prev) =>
        prev
          ? {
              ...prev,
              data: prev.data.map((u) => (u.id === user.id ? { ...u, role } : u)),
            }
          : prev
      );
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        {data?.meta ? plural(data.meta.total, t.accounts, locale) : dict.misc.loading}
      </p>

      {error ? (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner className="h-6 w-6" />
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-400 dark:border-zinc-800">
                <Th>{t.thId}</Th>
                <Th>{t.thUser}</Th>
                <Th>{t.thJoined}</Th>
                <Th>{t.thActivity}</Th>
                <Th>{t.thRole}</Th>
                <Th className="text-end">{t.thChangeRole}</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {data?.data.map((user) => (
                <tr key={user.id}>
                  <Td>{user.id}</Td>
                  <Td>
                    <p className="font-medium dark:text-zinc-100">{user.name ?? "—"}</p>
                    <p className="text-xs text-zinc-400">{user.email}</p>
                  </Td>
                  <Td>{formatDate(user.createdAt, locale)}</Td>
                  <Td className="text-xs">
                    {plural(user._count.orders, t.ordersCount, locale)} ·{" "}
                    {plural(user._count.reviews, t.reviewsCount, locale)}
                  </Td>
                  <Td>
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {user.role === "ADMIN" ? t.roleAdmin : t.roleCustomer}
                    </span>
                  </Td>
                  <Td className="text-end">
                    {savingId === user.id ? <Spinner className="me-2" /> : null}
                    <Select
                      value={user.role}
                      onChange={(e) => updateRole(user, e.target.value as Role)}
                      className="inline-block w-32 text-xs"
                      aria-label={fill(t.changeRoleAria, { email: user.email }, locale)}
                    >
                      {ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role === "ADMIN" ? t.roleAdmin : t.roleCustomer}
                        </option>
                      ))}
                    </Select>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.meta.totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-center gap-3 text-sm">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            {t.previous}
          </Button>
          <span className="text-zinc-500">
            {fill(dict.orders.pageOf, { a: data.meta.page, b: data.meta.totalPages }, locale)}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={data.meta.page >= data.meta.totalPages}
            onClick={() => setPage(page + 1)}
          >
            {t.next}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
