"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";

/**
 * `<img>` wrapper for arbitrary product image URLs.
 * Falls back to a neutral placeholder when missing or broken.
 * (Client component because of the `onError` handler.)
 */
export function ProductImage({
  src,
  alt,
  className,
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const placeholder =
    "flex items-center justify-center bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600";

  if (!src || failed) {
    return <div className={`${placeholder} ${className ?? ""}`}>
        <ImageOff className="h-6 w-6" />
      </div>;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={`object-cover ${className ?? ""}`}
      onError={() => setFailed(true)}
    />
  );
}
