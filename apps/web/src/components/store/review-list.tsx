"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/components/providers/locale-provider";
import { formatDate } from "@/lib/format";
import type { Review } from "@/lib/types";
import { RatingStars } from "./rating-stars";

/** Reviews of a product with delete for the author or an admin. */
export function ReviewList({ reviews }: { reviews: Review[] }) {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const { locale, dict } = useI18n();

  const remove = async (id: number) => {
    await api(`/reviews/${id}`, { method: "DELETE" });
    router.refresh();
  };

  if (reviews.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-200 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        {dict.products.noReviews}{" "}
        {user ? dict.products.beFirst : dict.products.signInToReview}
      </p>
    );
  }

  return (
    <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
      {reviews.map((review) => (
        <li key={review.id} className="flex items-start justify-between gap-4 py-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {review.user?.name || review.user?.email || dict.products.anonymous}
              </span>
              <span className="text-xs text-zinc-400">{formatDate(review.createdAt, locale)}</span>
            </div>
            <div className="mt-1.5">
              <RatingStars rating={review.rating} />
            </div>
            {review.comment ? (
              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                {review.comment}
              </p>
            ) : null}
          </div>
          {(isAdmin || user?.id === review.userId) && (
            <button
              type="button"
              onClick={() => remove(review.id)}
              aria-label={dict.products.deleteReview}
              title={dict.products.deleteReview}
              className="shrink-0 rounded-md p-2 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
