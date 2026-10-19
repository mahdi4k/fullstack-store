import { cn } from "@/lib/utils";

/** Shimmering placeholder used in loading states. */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-zinc-200/80 dark:bg-zinc-800",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
