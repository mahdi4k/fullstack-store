import Link from "next/link";
import { Suspense } from "react";
import { LoginCard } from "@/components/auth/login-form";
import { Spinner } from "@/components/ui/feedback";
import { serverLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localePath } from "@/lib/i18n/config";

/** `next=...` lets the login card send users back where they came from. */
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const locale = await serverLocale();
  const dict = getDictionary(locale);

  return (
    <div className="mx-auto flex max-w-md flex-col px-6 py-16">
      <Suspense fallback={<CenterSpinner />}>
        <LoginParams searchParams={searchParams} />
      </Suspense>
      <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
        {dict.login.newHere}{" "}
        <Link
          href={localePath(locale, "/register")}
          className="font-medium text-zinc-900 underline underline-offset-4 dark:text-zinc-100"
        >
          {dict.login.createAccount}
        </Link>
      </p>
    </div>
  );
}

/** Unwraps `?next=` after the route shells in, to keep prerendering fast. */
async function LoginParams({ searchParams }: { searchParams: SearchParams }) {
  const dict = getDictionary(await serverLocale());
  const params = await searchParams;
  const nextParam = typeof params.next === "string" ? params.next : undefined;

  return (
    <>
      <LoginCard nextPath={nextParam} />
      {nextParam ? (
        <p className="mt-3 text-center text-xs text-zinc-400">
          {dict.login.nextPrefix} <code>/…</code> {dict.login.nextSuffix}
        </p>
      ) : null}
    </>
  );
}

function CenterSpinner() {
  return (
    <div className="flex justify-center py-10">
      <Spinner className="h-6 w-6" />
    </div>
  );
}
