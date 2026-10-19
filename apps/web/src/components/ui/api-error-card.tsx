import { AlertCircle } from "lucide-react";
import { serverLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { dirOf } from "@/lib/i18n/config";

/**
 * Error card for server components whose API call failed
 * (e.g. backend not running). Keeps the page usable and localized.
 */
export async function ApiErrorCard({ error }: { error: Error }) {
  const locale = await serverLocale();
  const dict = getDictionary(locale);

  return (
    <div
      dir={dirOf(locale)}
      className="flex flex-col items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-8 py-10 text-center dark:border-red-900 dark:bg-red-950/30"
    >
      <AlertCircle className="h-8 w-8 text-red-500" />
      <div>
        <p className="font-medium text-red-800 dark:text-red-300">
          {dict.errors.apiTitle}
        </p>
        <p className="mt-1 max-w-md text-sm text-red-700/80 dark:text-red-300/70">
          {error.message}
        </p>
        <p className="mt-3 text-xs text-red-600/70 dark:text-red-400/70">
          {dict.errors.apiHintPrefix}{" "}
          <code className="rounded bg-red-100 px-1 py-0.5 dark:bg-red-900/50">
            npm run dev:api
          </code>
        </p>
      </div>
    </div>
  );
}
