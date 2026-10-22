import Link from "next/link";
import { formatToman } from "@/lib/format";
import { serverLocale } from "@/lib/i18n/server";
import { fill, getDictionary, plural } from "@/lib/i18n/dictionaries";
import { localePath } from "@/lib/i18n/config";
import type { Product } from "@/lib/types";
import { ProductImage } from "./product-image";
import { RatingStars } from "./rating-stars";

/**
 * Card for catalog grids. Server-safe: the "Add to cart" action
 * lives on the detail page so this stays renderable from the server.
 */
export async function ProductCard({ product }: { product: Product }) {
  const locale = await serverLocale();
  const dict = getDictionary(locale);
  const allReviews = product._count?.reviews ?? 0;

  return (
    <Link
      href={localePath(locale, `/products/${product.id}`)}
      className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="aspect-square w-full overflow-hidden bg-zinc-50 dark:bg-zinc-950">
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        {product.category ? (
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            {product.category.name}
          </span>
        ) : null}
        <h3 className="line-clamp-2 font-medium leading-snug text-zinc-900 dark:text-zinc-100">
          {product.name}
        </h3>
        {allReviews > 0 ? (
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            <RatingStars rating={null} /> ({plural(allReviews, dict.products.reviewsCount, locale)})
          </div>
        ) : null}
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {formatToman(product.price, locale)}
          </span>
          {product.stock > 0 ? (
            <span className="text-xs text-emerald-600 dark:text-emerald-400">
              {product.stock <= 5
                ? fill(dict.products.stockOnlyLeft, { n: product.stock }, locale)
                : dict.products.stockCardIn}
            </span>
          ) : (
            <span className="text-xs text-zinc-400">{dict.products.stockOut}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
