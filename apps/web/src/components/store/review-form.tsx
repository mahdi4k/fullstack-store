"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Star } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/feedback";
import { Textarea } from "@/components/ui/textarea";
import { errorMessage } from "@/lib/error";

/** Star picker + optional comment; posts to `POST /products/:id/reviews`. */
export function ReviewForm({ productId }: { productId: number }) {
  const { user } = useAuth();
  const { locale, dict, lp } = useI18n();
  const router = useRouter();
  const [rating, setRating] = React.useState(0);
  const [comment, setComment] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const nextPath = encodeURIComponent(lp(`/products/${productId}`));
  const signInLink = (
    <Link
      href={`${lp("/login")}?next=${nextPath}`}
      className="font-medium text-zinc-900 underline underline-offset-4 dark:text-zinc-100"
    >
      {dict.products.signInLink}
    </Link>
  );

  if (!user) {
    // Persian reads the "to write a review" part before the link.
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {locale === "fa" ? (
          <>
            {dict.products.toWriteReview.replace(/\.$/, "")}{" "}
            {signInLink}
          </>
        ) : (
          <>
            {signInLink} {dict.products.toWriteReview}
          </>
        )}
      </p>
    );
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (rating === 0) return;
    setBusy(true);
    setError(null);
    try {
      await api(`/products/${productId}/reviews`, {
        method: "POST",
        body: { rating, ...(comment.trim() ? { comment: comment.trim() } : {}) },
        token: null,
      });
      setRating(0);
      setComment("");
      router.refresh();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="flex items-center gap-1" role="radiogroup" aria-label={dict.products.ratingAria}>
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={rating === value}
            onClick={() => setRating(value)}
            className="rounded p-0.5"
          >
            <Star
              className={
                value <= rating
                  ? "h-6 w-6 fill-amber-400 text-amber-400"
                  : "h-6 w-6 fill-transparent text-zinc-300 transition-colors hover:text-amber-300 dark:text-zinc-600"
              }
            />
          </button>
        ))}
        {rating > 0 ? (
          <span className="ms-2 text-xs text-zinc-500">{rating} / 5</span>
        ) : null}
      </div>
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={dict.products.reviewPlaceholder}
        maxLength={500}
        rows={3}
      />
      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
      <Button type="submit" size="sm" disabled={busy || rating === 0} className="gap-2">
        {busy ? <Spinner /> : null}
        {dict.products.submitReview}
      </Button>
    </form>
  );
}
