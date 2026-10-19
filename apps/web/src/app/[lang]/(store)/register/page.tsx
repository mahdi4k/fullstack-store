import Link from "next/link";
import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/register-form";
import { Spinner } from "@/components/ui/feedback";
import { serverLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localePath } from "@/lib/i18n/config";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const locale = await serverLocale();
  const dict = getDictionary(locale);

  return (
    <div className="mx-auto flex max-w-md flex-col px-6 py-16">
      <Suspense fallback={<CenterSpinner />}>
        <RegisterParams searchParams={searchParams} />
      </Suspense>
      <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
        {dict.register.haveAccount}{" "}
        <Link
          href={localePath(locale, "/login")}
          className="font-medium text-zinc-900 underline underline-offset-4 dark:text-zinc-100"
        >
          {dict.register.signInLink}
        </Link>
      </p>
    </div>
  );
}

/** Unwraps `?next=` after the route shells in, to keep prerendering fast. */
async function RegisterParams({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const nextParam = typeof params.next === "string" ? params.next : undefined;
  return <RegisterForm nextPath={nextParam} />;
}

function CenterSpinner() {
  return (
    <div className="flex justify-center py-10">
      <Spinner className="h-6 w-6" />
    </div>
  );
}
