import type { ReactNode } from "react";

/** Shared table chrome for the admin screens. */

export function Th({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <th className={`px-4 py-3 font-medium ${className}`}>{children}</th>;
}

export function Td({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <td className={`px-4 py-3 text-zinc-600 dark:text-zinc-300 ${className}`}>
      {children}
    </td>
  );
}
