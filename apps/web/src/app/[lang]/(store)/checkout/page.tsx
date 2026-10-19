import { Suspense } from "react";
import type { Metadata } from "next";
import { RequireAuth } from "@/components/providers/auth-provider";
import { CheckoutView } from "@/components/account/checkout-view";
import { Spinner } from "@/components/ui/feedback";
import { serverLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionaries";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/checkout">): Promise<Metadata> {
  const { lang } = await params;
  return { title: getDictionary(lang as never).checkout.title };
}

export default function CheckoutPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <RequireAuth>
      <Suspense fallback={<CenterSpinner />}>
        <CheckoutParams searchParams={searchParams} />
      </Suspense>
    </RequireAuth>
  );
}

/** Reads the "Buy now" params so the client view stays simple. */
async function CheckoutParams({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const buyNowId = firstString(params.productId);
  const buyNowQty = firstString(params.quantity);
  const productId = Number(buyNowId);
  const quantity = Number(buyNowQty);

  return (
    <CheckoutView
      productId={productId > 0 ? productId : undefined}
      quantity={quantity > 0 ? quantity : undefined}
    />
  );
}

function firstString(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function CenterSpinner() {
  return (
    <div className="flex justify-center py-24">
      <Spinner className="h-6 w-6" />
    </div>
  );
}
