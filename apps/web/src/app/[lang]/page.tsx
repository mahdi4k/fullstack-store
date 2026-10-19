import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { serverLocale } from "@/lib/i18n/server";
import { CITY_COOKIE } from "@/lib/city";
import { CityGateSheet } from "@/components/storefront/city-gate-sheet";

/**
 * `/` entry — city gate. The prerendered shell shows a loading state;
 * inside `<Suspense>` we check the saved city cookie and either redirect
 * to that storefront or render the city-selection page.
 */
export default function CityGatePage() {
  return (
    <Suspense fallback={<GateLoading />}>
      <GateContent />
    </Suspense>
  );
}

async function GateContent() {
  const locale = await serverLocale();

  const jar = await cookies();
  const saved = jar.get(CITY_COOKIE)?.value;
  if (saved) redirect(`/${locale}/city/${saved}`);

  return <CityGateSheet />;
}

function GateLoading() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full max-w-md space-y-3">
        <Skeleton className="h-16 w-16 rounded-2xl" />
        <Skeleton className="h-7 w-48 rounded-lg" />
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
