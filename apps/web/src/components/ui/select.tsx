import * as React from "react";
import { cn } from "@/lib/utils";

/** Styled native `<select>` — no extra dependencies needed. */
const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "flex h-9 w-full rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm shadow-sm",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "dark:border-zinc-800 dark:bg-zinc-950 dark:focus-visible:ring-zinc-100/20",
      className
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";

export { Select };
