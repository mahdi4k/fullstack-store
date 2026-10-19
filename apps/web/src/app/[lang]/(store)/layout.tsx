import { Suspense } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

/**
 * Layout for the classic store sections (products, cart, orders, admin…).
 * The city marketplace (`/city/…`) uses its own mobile-first shell instead.
 */
export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      {/* Navbar reads the active route, so it streams in after the shell */}
      <Suspense fallback={<div className="h-16 border-b border-zinc-200 dark:border-zinc-800" />}>
        <Navbar />
      </Suspense>
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
