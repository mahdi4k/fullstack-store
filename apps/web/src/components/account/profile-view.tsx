"use client";

import * as React from "react";
import { KeyRound, UserRound } from "lucide-react";
import { api } from "@/lib/api";
import { errorMessage } from "@/lib/error";
import { formatDate } from "@/lib/format";
import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/feedback";

interface ProfilePayload {
  message: string;
  user: { id: number; email: string; name?: string | null; role: string; updatedAt: string };
}

/**
 * Profile manager: shows the current account info and lets the user
 * update name and password (`PATCH /auth/profile`).
 */
export function ProfileView() {
  const { user, updateLocalUser, logout } = useAuth();
  const { locale, dict } = useI18n();
  const [name, setName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        const profile = await api<ProfilePayload>("/auth/profile");
        setName(profile.user.name ?? "");
      } catch {
        // Providers already validate the token; ignore refresh failures here.
      }
    })();
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      const res = await api<ProfilePayload>("/auth/profile", {
        method: "PATCH",
        body: {
          ...(name.trim() ? { name: name.trim() } : {}),
          ...(password ? { password } : {}),
        },
      });
      updateLocalUser({
        id: res.user.id,
        email: res.user.email,
        name: res.user.name,
        role: res.user.role === "ADMIN" ? "ADMIN" : "CUSTOMER",
      });
      setPassword("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-6 py-10">
      <h1 className="text-2xl font-bold tracking-tight">{dict.profile.title}</h1>

      <div className="mt-6 flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
          <UserRound className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-zinc-900 dark:text-zinc-100">
            {user?.name || dict.profile.unnamed}
            <span className="ms-2 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium uppercase text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              {user?.role}
            </span>
          </p>
          <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">{user?.email}</p>
          {user?.createdAt ? (
            <p className="mt-0.5 text-xs text-zinc-400">
              {dict.profile.memberPrefix} {formatDate(user.createdAt, locale)}
            </p>
          ) : null}
        </div>
      </div>

      <form
        onSubmit={submit}
        className="mt-6 space-y-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="space-y-1.5">
          <label htmlFor="profile-name" className="text-sm font-medium">
            {dict.profile.displayName}
          </label>
          <Input
            id="profile-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={dict.profile.displayNamePlaceholder}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="profile-password" className="text-sm font-medium">
            {dict.profile.newPassword}
            <span className="ms-1 font-normal text-zinc-400">{dict.profile.keepCurrent}</span>
          </label>
          <Input
            id="profile-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={dict.profile.passwordPlaceholder}
            minLength={6}
            autoComplete="new-password"
          />
        </div>

        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : null}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={busy} className="gap-2">
            {busy ? <Spinner /> : <KeyRound className="h-4 w-4" />}
            {dict.profile.save}
          </Button>
          {saved ? (
            <span className="text-sm text-emerald-600 dark:text-emerald-400">
              {dict.profile.saved}
            </span>
          ) : null}
        </div>
      </form>

      <button
        type="button"
        onClick={logout}
        className="mt-6 text-sm text-zinc-500 underline underline-offset-4 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400"
      >
        {dict.profile.signOutDevice}
      </button>
    </div>
  );
}
