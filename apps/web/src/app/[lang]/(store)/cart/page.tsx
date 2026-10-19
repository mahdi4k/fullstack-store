import type { Metadata } from "next";
import { RequireAuth } from "@/components/providers/auth-provider";
import { CartView } from "@/components/account/cart-view";
import { serverLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionaries";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/cart">): Promise<Metadata> {
  const { lang } = await params;
  return { title: getDictionary(lang as never).cart.title };
}

export default function CartPage() {
  return (
    <RequireAuth>
      <CartView />
    </RequireAuth>
  );
}
