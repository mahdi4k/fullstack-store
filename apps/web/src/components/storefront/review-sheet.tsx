"use client";

import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Star } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/components/providers/locale-provider";
import { BottomSheet } from "./bottom-sheet";
import { cn } from "@/lib/utils";

interface ReviewSheetProps {
  open: boolean;
  onClose: () => void;
  productId: number;
  productName?: string;
}

/** «ثبت نظر» sheet: 1–5 stars + comment, POSTed to the reviews API. */
export function ReviewSheet({ open, onClose, productId }: ReviewSheetProps) {
  const { dict, locale } = useI18n();
  const { user } = useAuth();
  const [rating, setRating] = React.useState(0);
  const [comment, setComment] = React.useState("");

  const submit = useMutation({
    mutationFn: () =>
      api(`/products/${productId}/reviews`, {
        method: "POST",
        body: { rating, comment: comment.trim() || undefined },
      }),
    onSuccess: () => {
      toast.success(dict.store.review.thanks);
      setRating(0);
      setComment("");
      onClose();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (rating === 0) return;
    submit.mutate();
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={dict.store.review.title}>
      {!user ? (
        <p className="mb-3 rounded-lg bg-zinc-100 p-3 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          {dict.store.review.loginRequired}
        </p>
      ) : null}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <p className="mb-2 text-sm font-medium text-zinc-800 dark:text-zinc-100">
            {dict.store.review.prompt}
          </p>
          <div className="flex justify-center gap-1" role="radiogroup" aria-label={dict.store.review.prompt}>
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                aria-label={`${value}`}
                onClick={() => setRating(value)}
                className="p-1"
              >
                <Star
                  className={cn(
                    "h-7 w-7 transition-colors",
                    value <= rating
                      ? "fill-amber-400 text-amber-400"
                      : "text-zinc-300 dark:text-zinc-600"
                  )}
                />
              </button>
            ))}
          </div>
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={dict.store.review.placeholder}
          rows={3}
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm outline-none placeholder:text-zinc-400 focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        />
        <button
          type="submit"
          disabled={rating === 0 || submit.isPending || !user}
          className="h-11 w-full rounded-xl bg-emerald-600 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {dict.store.review.submit}
        </button>
      </form>
    </BottomSheet>
  );
}
