import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeTone = "default" | "outline";

function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variant === "default" &&
          "border-transparent bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900",
        variant === "outline" &&
          "border-zinc-200 text-zinc-700 dark:border-zinc-800 dark:text-zinc-300",
        className
      )}
      {...props}
    />
  );
}

export { Badge };
