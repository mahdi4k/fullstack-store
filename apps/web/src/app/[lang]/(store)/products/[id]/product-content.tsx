import { ApiErrorCard } from "@/components/ui/api-error-card";
import { AddToCartControls } from "@/components/store/add-to-cart-button";
import { ProductImage } from "@/components/store/product-image";
import { RatingStars } from "@/components/store/rating-stars";
import { ReviewForm } from "@/components/store/review-form";
import { ReviewList } from "@/components/store/review-list";
import { fetchProduct } from "@/lib/queries";
import { formatMoney, stockInfo } from "@/lib/format";
import { serverLocale } from "@/lib/i18n/server";
import { getDictionary, fill, plural } from "@/lib/i18n/dictionaries";
import { localePath } from "@/lib/i18n/config";
import type { ProductDetail } from "@/lib/types";

/** Main detail view: image, info, buy controls, then the reviews section. */
export async function ProductContent({ productId }: { productId: number }) {
  const locale = await serverLocale();
  const dict = getDictionary(locale);

  let product: ProductDetail;

  try {
    product = await fetchProduct(productId);
  } catch (error) {
    return <ApiErrorCard error={error as Error} />;
  }

  const stock = stockInfo(product.stock, dict.products, locale);
  const ratingText = product.averageRating
    ? fill(dict.products.outOf5, { a: product.averageRating.toFixed(1) }, locale)
    : null;

  return (
    <>
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            className="aspect-square w-full"
          />
        </div>

        <div className="flex flex-col gap-4">
          {product.category ? (
            <a
              href={`${localePath(locale, "/products")}?categoryId=${product.category.id}`}
              className="w-fit text-xs font-medium uppercase tracking-wide text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              {product.category.name}
            </a>
          ) : null}

          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {product.name}
          </h1>

          <div className="flex items-center gap-3">
            <RatingStars rating={product.averageRating} />
            {ratingText ? (
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                {ratingText} · {plural(product.reviewsCount, dict.products.reviewsCount, locale)}
              </span>
            ) : (
              <span className="text-sm text-zinc-400">{dict.products.noRatings}</span>
            )}
          </div>

          <p className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {formatMoney(product.price, locale)}
          </p>

          <p
            className={
              stock.inStock
                ? "text-sm text-emerald-600 dark:text-emerald-400"
                : "text-sm text-zinc-500"
            }
          >
            {stock.text}
          </p>

          <AddToCartControls product={product} />
        </div>
      </div>

      {product.description ? (
        <section className="mt-12">
          <h2 className="text-xl font-semibold tracking-tight">{dict.products.description}</h2>
          <p className="mt-3 leading-relaxed text-zinc-600 dark:text-zinc-300">
            {product.description}
          </p>
        </section>
      ) : null}

      <ReviewsSection product={product} />
    </>
  );
}

async function ReviewsSection({ product }: { product: ProductDetail }) {
  const locale = await serverLocale();
  const dict = getDictionary(locale);
  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold tracking-tight">
        {dict.products.reviews}{" "}
        <span className="text-sm font-normal text-zinc-500">
          ({product.reviewsCount})
        </span>
      </h2>
      <div className="mt-4 rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
        <ReviewForm productId={product.id} />
      </div>
      <div className="mt-2">
        <ReviewList reviews={product.reviews} />
      </div>
    </section>
  );
}
