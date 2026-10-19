import { Suspense } from "react";
import type { Metadata } from "next";
import { RequireAuth } from "@/components/providers/auth-provider";
import { OrdersList } from "@/components/account/orders-list";
import { Spinner } from "@/components/ui/feedback";
import { serverLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionaries";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/orders">): Promise<Metadata> {
  const { lang } = await params;
  return { title: getDictionary(lang as never).orders.title };
}

export default function OrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <RequireAuth>
      <Suspense fallback={<CenterSpinner />}>
        <OrdersParams searchParams={searchParams} />
      </Suspense>
    </RequireAuth>
  );
}

/** Unwraps `?page=` after the route shells in. */
async function OrdersParams({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const pageParam = Array.isArray(params.page) ? params.page[0] : params.page;
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1;

  return <OrdersList page={page} />;
}

function CenterSpinner() {
  return (
    <div className="flex justify-center py-24">
      <Spinner className="h-6 w-6" />
    </div>
  );
}
