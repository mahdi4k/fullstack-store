import { cn } from "@/lib/utils";

/** Friendly empty-state message with an optional call-to-action child. */
export function EmptyState({
  icon,
  title,
  description,
  className,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 py-16 text-center dark:border-zinc-800",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-500">
        {icon}
      </div>
      <p className="mt-4 font-medium text-zinc-900 dark:text-zinc-100">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      ) : null}
      {children ? <div className="mt-5">{children}</div> : null}
    </div>
  );
}
