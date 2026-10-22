import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchStorefront, fetchCityProducts } from "@/lib/storefront";
import { StorefrontHeader } from "@/components/storefront/storefront-header";
import { SearchBar } from "@/components/storefront/search-bar";
import { QuickFilterPills } from "@/components/storefront/quick-filter-pills";
import { HeroSlider } from "@/components/storefront/hero-slider";
import { CategoryGrid } from "@/components/storefront/category-grid";
import { UtilitiesSection } from "@/components/storefront/utilities-section";
import { ProductRail } from "@/components/storefront/product-rail";
import { VendorRail } from "@/components/storefront/vendor-rail";
import { StickyCartBar } from "@/components/storefront/sticky-cart-bar";
import { SupportBar } from "@/components/storefront/support-bar";
import { SectionHeader } from "@/components/storefront/section-header";
import { getDictionary, hasLocale } from "@/lib/i18n/dictionaries";
import { cookies } from "next/headers";
import { CAR_COOKIE } from "@/lib/city";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; citySlug: string }>;
}): Promise<Metadata> {
  const { citySlug } = await params;
  return { title: "خرید و خدمات خودرو" };
}

interface PageProps {
  params: Promise<{ lang: string; citySlug: string }>;
}

/**
 * City storefront home (`/[lang]/city/[citySlug]`). The page shell is
 * static; all API-driven content streams inside `<Suspense>` (the
 * app runs with `cacheComponents`).
 */
export default function StorefrontPage({ params }: PageProps) {
  return (
    <Suspense fallback={<StorefrontSkeleton />}>
      <StorefrontContent params={params} />
    </Suspense>
  );
}

async function StorefrontContent({ params }: PageProps) {
  const { lang, citySlug } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);

  const jar = await cookies();
  const rawCar = jar.get(CAR_COOKIE)?.value;
  const car = rawCar ? decodeURIComponent(rawCar) : null;

  const storefront = await fetchStorefront(citySlug);
  const city = storefront.city;

  // Special offers: discounted products in this city (fire pill rail).
  const offers = await fetchCityProducts({
    city: citySlug,
    limit: 30,
    vehicle: car ?? undefined,
  }).then(
    (res) =>
      [...res.data]
        .filter((p) => (p.discountPercent ?? 0) > 0)
        .sort((a, b) => (b.discountPercent ?? 0) - (a.discountPercent ?? 0))
  );

  return (
    <div
      dir={lang === "fa" ? "rtl" : "ltr"}
      lang={lang}
      className="mx-auto min-h-dvh max-w-md bg-white px-4 pb-32 dark:bg-zinc-950 md:max-w-xl"
    >
      <StorefrontHeader
        citySlug={city.slug}
        cityName={city.name}
        car={car}
        vehicles={storefront.vehicles}
      />

      <div className="space-y-4 pt-3">
        {/* Live search by product name or car model */}
        <SearchBar citySlug={city.slug} />

        {/* Quick-filter pills */}
        <QuickFilterPills citySlug={city.slug} />

        {/* Hero banners */}
        <HeroSlider banners={storefront.banners} />

        {/* Category grid with per-city product counts */}
        <section>
          <SectionHeader title={dict.store.sections.categories} />
          <CategoryGrid citySlug={city.slug} categories={storefront.categories} />
        </section>

        {/* Vehicle oil & filter packs (service kits, city pricing) */}
        <ProductRail
          title={dict.store.sections.servicePacks}
          citySlug={city.slug}
          products={storefront.bundles.filter(
            (bundle) =>
              !car ||
              (bundle.compatibleVehicles ?? []).length === 0 ||
              (bundle.compatibleVehicles ?? []).includes(car)
          )}
          viewAllHref={`/${lang}/city/${city.slug}/category/oils-lubricants`}
        />

        {/* Special offers */}
        <ProductRail
          title={dict.store.sections.specialOffers}
          citySlug={city.slug}
          products={offers}
        />

        {/* Local vendors */}
        {storefront.vendors.length > 0 ? (
          <section>
            <SectionHeader title={dict.store.sections.vendors} />
            <VendorRail vendors={storefront.vendors} />
          </section>
        ) : null}

        {/* Car services / utilities */}
        <section>
          <SectionHeader title={dict.store.sections.utilities} />
          <UtilitiesSection citySlug={city.slug} />
        </section>

        {/* Support call bar */}
        <SupportBar />
      </div>

      {/* Floating cart summary */}
      <StickyCartBar />
    </div>
  );
}

function StorefrontSkeleton() {
  return (
    <div className="mx-auto min-h-dvh max-w-md bg-white px-4 pb-32 dark:bg-zinc-950 md:max-w-xl">
      <div className="flex h-14 items-center justify-between">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-5 w-16" />
      </div>
      <div className="space-y-4 pt-3">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-44 w-full rounded-2xl" />
      </div>
    </div>
  );
}
