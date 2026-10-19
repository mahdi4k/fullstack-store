import type { Metadata } from "next";

/**
 * Mobile-first city marketplace shell — a centered `max-w-md` column,
 * no global Navbar/Footer (the storefront header lives per page).
 */
export const metadata: Metadata = {
  title: {
    default: "مای‌استور گاراژ",
    template: "%s · مای‌استور گاراژ",
  },
};

export default function CityLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-zinc-50 dark:bg-zinc-950">{children}</div>;
}
