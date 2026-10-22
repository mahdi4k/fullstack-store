import { Suspense } from "react";
import { StoreAppHeader } from "./store-app-header";
import { Footer } from "@/components/layout/footer";

/**
 * Layout for the classic store sections (cart, login, orders…).
 * Uses the same mobile-first marketplace header as `/city/…` pages so
 * the chrome is identical everywhere; content matches the storefront's
 * narrow column (max-w-md phone → max-w-xl desktop).
 */
export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      {/* Header needs the city cookie, streamed after the shell */}
      <Suspense fallback={<div className="h-14 border-b border-zinc-200 dark:border-zinc-800" />}>
        <StoreAppHeader />
      </Suspense>
      <main className="mx-auto w-full max-w-md flex-1 px-4 pb-16 md:max-w-xl">
        {children}
      </main>
      <Footer />
    </div>
  );
}
