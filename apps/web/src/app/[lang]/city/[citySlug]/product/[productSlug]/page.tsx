import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchCities } from "@/lib/storefront";
import { getProductBySlug } from "@/lib/queries";
import { StorefrontHeader } from "@/components/storefront/storefront-header";
import { StickyCartBar } from "@/components/storefront/sticky-cart-bar";
import { ProductStickyBar } from "@/components/storefront/product-sticky-bar";
import { CompatibleBadges } from "@/components/storefront/compatible-badges";
import { BundleContents } from "@/components/storefront/bundle-contents";
import { ReviewSheetLauncher } from "@/components/storefront/review-sheet-launcher";
import { SupportBar } from "@/components/storefront/support-bar";
import { fill, getDictionary, hasLocale } from "@/lib/i18n/dictionaries";
import { CONTAINER } from "@/lib/layout";
import { BundleQty } from "@/components/storefront/bundle-qty";
import { formatPercent } from "@/lib/format";
import { Wrench, CreditCard } from "lucide-react";

interface PageProps {
  params: Promise<{ lang: string; citySlug: string; productSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { citySlug, productSlug } = await params;
  const product = await getProductBySlug(productSlug, citySlug).catch(() => null);
  if (!product) return {};
  return { title: product.name };
}

/**
 * Product page (`/[lang]/city/[citySlug]/product/[productSlug]`):
 * image block, compatible vehicles, bundle contents, service badge,
 * city pricing with discount, and a sticky add-to-cart bar.
 */
export default function ProductPage({ params }: PageProps) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductContent params={params} />
    </Suspense>
  );
}

async function ProductContent({ params }: PageProps) {
  const { lang, citySlug, productSlug } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);

  const all = await fetchCities();
  const city = all.find((c) => c.slug === citySlug);
  if (!city) notFound();

  const product = await getProductBySlug(productSlug, citySlug);
  if (!product) notFound();

  const base = product.cityPrice ?? product.price;
  const discount = product.discountPercent ?? 0;
  const final = product.finalPrice ?? Math.round(base * (1 - discount / 100));
  const cityStock = product.cityStock ?? product.stock;

  return (
    <div
      dir={lang === "fa" ? "rtl" : "ltr"}
      lang={lang}
      className="min-h-dvh bg-white dark:bg-zinc-950"
    >
      <StorefrontHeader citySlug={citySlug} cityName={city.name} />

      <div className={`${CONTAINER} pb-40 pt-3`}>
      <div className="md:grid md:grid-cols-5 md:items-start md:gap-8">
      {/* Gallery — sticky visual column on desktop */}
      <div className="relative flex h-64 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 to-zinc-100 dark:from-emerald-950/40 dark:to-zinc-800 md:sticky md:top-20 md:col-span-2 md:h-80">
        {discount > 0 ? (
          <span className="absolute top-3 start-3 rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white">
            {formatPercent(discount, lang)}
          </span>
        ) : null}
        {product.brand ? (
          <span className="text-lg font-bold text-zinc-400">{product.brand}</span>
        ) : null}
      </div>

      <div className="mt-4 space-y-4 md:col-span-3 md:mt-0">
        {/* Title + service inclusion badge */}
        <div>
          <h1 className="text-base font-extrabold leading-7 text-zinc-900 dark:text-zinc-50">
            {product.name}
          </h1>
          {product.hasInstallationService ? (
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              <Wrench className="h-3 w-3" />
              {dict.store.product.serviceBadge}
            </span>
          ) : null}
        </div>

        {/* Compatible vehicle badges */}
        {(product.compatibleVehicles?.length ?? 0) > 0 ? (
          <section>
            <p className="mb-1.5 text-xs font-bold text-zinc-500">
              {dict.store.product.compatible}
            </p>
            <CompatibleBadges vehicles={product.compatibleVehicles ?? []} />
          </section>
        ) : null}

        {/* Included bundle items (split from the description) */}
        <BundleContents description={product.description ?? null} />

        {/* Stock line */}
        <p className="text-xs text-zinc-500">
          {cityStock > 0
            ? fill(dict.store.product.inStock, { city: city.name }, lang)
            : dict.store.product.outOfStock}
        </p>

        {/* Digipay installments hint */}
        <div className="flex items-center gap-2 rounded-xl bg-sky-50 p-3 text-xs text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
          <CreditCard className="h-4 w-4" />
          {dict.store.product.installments}
        </div>

        {/* Review sheet trigger */}
        <ReviewSheetLauncher productId={product.id} />

        {/* Support call bar */}
        <SupportBar />
      </div>

        {/* Desktop inline add-to-cart (sticky bar is mobile-only) */}
        <div className="hidden md:block lg:max-w-64">
          <BundleQty product={product} citySlug={citySlug} />
        </div>
      </div>
      </div>

      {/* Sticky price + add-to-cart bar (mobile only) */}
      <div className="md:hidden">
      <ProductStickyBar
        productId={product.id}
        productSlug={product.slug ?? String(product.id)}
        citySlug={citySlug}
        base={base}
        final={final}
        discount={discount}
        soldOut={cityStock <= 0}
      />
      </div>

      {/* Floating cart summary */}
      <StickyCartBar />
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950">
      <div className="flex h-14 items-center justify-between px-4">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-5 w-16" />
      </div>
      <div className="space-y-4 pt-4">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}
