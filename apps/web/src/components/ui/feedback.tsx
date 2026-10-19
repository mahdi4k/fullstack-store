import { cn } from "@/lib/utils";

/** Inline spinner for buttons and loading rows. */
function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent opacity-60",
        className
      )}
      aria-hidden
    />
  );
}

function Alert({
  title,
  message,
  tone = "error",
  className,
}: {
  title: string;
  message?: string;
  tone?: "error" | "success" | "info";
  className?: string;
}) {
  const tones = {
    error:
      "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300",
    success:
      "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
    info: "border-zinc-200 bg-zinc-50 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300",
  } as const;
  return (
    <div className={cn("rounded-lg border px-4 py-3 text-sm", tones[tone], className)}>
      <p className="font-medium">{title}</p>
      {message ? <p className="mt-0.5 text-[13px] opacity-90">{message}</p> : null}
    </div>
  );
}

export { Spinner, Alert };
