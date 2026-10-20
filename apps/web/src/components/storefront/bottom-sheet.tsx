"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Mobile-style bottom sheet: dark backdrop + slide-up panel.
 * Pure client (translate-y transition), no portal needed inside a
 * mobile-first page shell.
 */
export function BottomSheet({
  open,
  onClose,
  title,
  children,
  className,
}: BottomSheetProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      // Double rAF so the first frame renders closed (translate-y-full)
      // and the second animates up.
      const raf = requestAnimationFrame(() =>
        requestAnimationFrame(() => setMounted(true))
      );
      return () => cancelAnimationFrame(raf);
    }
    setMounted(false);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 mx-auto max-w-md">
      {/* Backdrop */}
      <button
        aria-label="close"
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-black/50 transition-opacity duration-200",
          mounted ? "opacity-100" : "opacity-0"
        )}
      />
      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "absolute inset-x-0 bottom-0 rounded-t-3xl bg-white p-5 pb-8 shadow-2xl transition-transform duration-300 ease-out dark:bg-zinc-900",
          mounted ? "translate-y-0" : "translate-y-full",
          className
        )}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-zinc-300 dark:bg-zinc-700" />
        {title ? (
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-full bg-zinc-100 p-1.5 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}
