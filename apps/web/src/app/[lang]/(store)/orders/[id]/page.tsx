import { Suspense } from "react";
import type { Metadata } from "next";
import { RequireAuth } from "@/components/providers/auth-provider";
import { OrderDetailView } from "@/components/account/order-detail-view";
import { Skeleton } from "@/components/ui/skeleton";
import { serverLocale } from "@/lib/i18n/server";
import { getDictionary, fill } from "@/lib/i18n/dictionaries";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/orders/[id]">): Promise<Metadata> {
  const [{ id }, locale] = await Promise.all([params, serverLocale()]);
  return { title: fill(getDictionary(locale).order.titleN, { n: id }, locale) };
}

export default function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: SearchParams;
}) {
  return (
    <RequireAuth>
      <Suspense fallback={<DetailSkeleton />}>
        <OrderParams params={params} searchParams={searchParams} />
      </Suspense>
    </RequireAuth>
  );
}

/** Unwraps the order id and the `?placed=1` confirmation flag. */
async function OrderParams({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: SearchParams;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  return (
    <OrderDetailView orderId={Number(id)} justPlaced={query.placed === "1"} />
  );
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}
