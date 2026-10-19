"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { errorMessage, safeNextPath } from "@/lib/error";
import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/components/providers/locale-provider";
import { useCart } from "@/components/providers/cart-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** Email/password card that authenticates against `POST /auth/login`. */
export function LoginCard({ nextPath }: { nextPath?: string }) {
  const { login } = useAuth();
  const { refresh } = useCart();
  const router = useRouter();
  const { dict, lp } = useI18n();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email, password);
      await refresh();
      router.push(lp(safeNextPath(nextPath)));
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <h1 className="text-xl font-bold tracking-tight">{dict.login.title}</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        {dict.login.subtitle}
      </p>

      <div className="mt-5 space-y-4">
        <Field
          id="login-email"
          label={dict.login.email}
          type="email"
          autoComplete="email"
          placeholder={dict.login.emailPlaceholder}
          value={email}
          onChange={setEmail}
        />
        <Field
          id="login-password"
          label={dict.login.password}
          type="password"
          autoComplete="current-password"
          placeholder={dict.login.passwordPlaceholder}
          value={password}
          onChange={setPassword}
        />
      </div>

      {error ? (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}

      <Button type="submit" size="lg" disabled={busy} className="mt-6 w-full gap-2">
        <LogIn className="h-4 w-4" />
        {dict.login.submit}
      </Button>
    </form>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  ...rest
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <Input
        id={id}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...rest}
      />
    </div>
  );
}
