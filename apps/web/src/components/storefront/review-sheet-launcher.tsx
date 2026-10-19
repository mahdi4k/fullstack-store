"use client";

import * as React from "react";
import { MessageSquarePlus } from "lucide-react";
import { useI18n } from "@/components/providers/locale-provider";
import { ReviewSheet } from "./review-sheet";

/** Button + sheet opener for the «ثبت نظر» review flow on the PDP. */
export function ReviewSheetLauncher({ productId }: { productId: number }) {
  const { dict } = useI18n();
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 py-3 text-xs font-bold text-zinc-600 hover:border-amber-400 hover:text-amber-700 dark:border-zinc-700 dark:text-zinc-300"
      >
        <MessageSquarePlus className="h-4 w-4" />
        {dict.store.review.title}
      </button>
      <ReviewSheet open={open} onClose={() => setOpen(false)} productId={productId} />
    </>
  );
}
