"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { UserRoundPlus } from "lucide-react";
import { errorMessage, safeNextPath } from "@/lib/error";
import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** Creates an account via `POST /auth/register`, then signs the user in. */
export function RegisterForm({ nextPath }: { nextPath?: string }) {
  const { register } = useAuth();
  const router = useRouter();
  const { dict, lp } = useI18n();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await register(email, password, name.trim() || undefined);
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
      <h1 className="text-xl font-bold tracking-tight">{dict.register.title}</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        {dict.register.subtitle}
      </p>

      <div className="mt-5 space-y-4">
        <Field
          id="register-name"
          label={dict.register.name}
          type="text"
          autoComplete="name"
          placeholder={dict.register.namePlaceholder}
          value={name}
          onChange={setName}
        />
        <Field
          id="register-email"
          label={dict.register.email}
          type="email"
          autoComplete="email"
          placeholder={dict.register.emailPlaceholder}
          value={email}
          onChange={setEmail}
        />
        <Field
          id="register-password"
          label={dict.register.password}
          type="password"
          autoComplete="new-password"
          placeholder={dict.register.passwordPlaceholder}
          minLength={6}
          value={password}
          onChange={setPassword}
        />
      </div>

      {error ? (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        disabled={busy}
        className="mt-6 w-full gap-2"
      >
        <UserRoundPlus className="h-4 w-4" />
        {dict.register.submit}
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
