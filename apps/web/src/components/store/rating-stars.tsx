import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Row of five stars showing 1–5 filled for the whole part of `rating`.
 * `rating: null` renders neutral stars (e.g. unknown average yet).
 */
export function RatingStars({
  rating,
  size = "sm",
}: {
  rating: number | null;
  size?: "sm" | "lg";
}) {
  const filled = Math.max(0, Math.min(5, Math.round(rating ?? 0)));
  return (
    <span className="inline-flex items-center gap-0.5" title={rating ? `${rating.toFixed(1)} / 5` : undefined}>
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          className={cn(
            size === "lg" ? "h-5 w-5" : "h-3.5 w-3.5",
            value <= filled
              ? "fill-amber-400 text-amber-400"
              : "fill-transparent text-zinc-300 dark:text-zinc-600"
          )}
        />
      ))}
    </span>
  );
}
