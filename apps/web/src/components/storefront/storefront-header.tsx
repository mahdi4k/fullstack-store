"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ShoppingCart,
  Menu,
  MapPin,
  ChevronDown,
  Wrench,
  X,
} from "lucide-react";
import { useI18n } from "@/components/providers/locale-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { CitySheet } from "./city-sheet";
import { useCart } from "@/components/providers/cart-provider";

interface StorefrontHeaderProps {
  citySlug: string;
  cityName: string;
}

/**
 * Sticky translucent storefront header: back, sticky city badge,
 * cart count badge, and a menu drawer.
 */
export function StorefrontHeader({ citySlug, cityName }: StorefrontHeaderProps) {
  const { dict, locale } = useI18n();
  const router = useRouter();
  const { user } = useAuth();
  const { totalItems } = useCart();
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-zinc-200/70 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/90">
        <div className="mx-auto flex h-14 max-w-md items-center gap-2 px-4">
          <button
            aria-label={dict.store.header.back}
            onClick={() => router.back()}
            className="rounded-full p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <ArrowRight className="h-5 w-5 rtl:-scale-x-100" />
          </button>

          {/* City badge — opens the city switch sheet */}
          <button
            onClick={() => setSheetOpen(true)}
            className="flex items-center gap-0.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
          >
            <MapPin className="h-3.5 w-3.5" />
            {cityName}
            <ChevronDown className="h-3 w-3 opacity-60" />
          </button>

          <div className="flex-1" />

          {/* Cart with count badge */}
          <Link
            href={`/${locale}/cart`}
            aria-label={dict.store.header.cart}
            className="relative rounded-full p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <ShoppingCart className="h-5 w-5 rtl:-scale-x-100" />
            {totalItems > 0 ? (
              <span className="absolute -top-0.5 start-6 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white">
                {totalItems}
              </span>
            ) : null}
          </Link>

          <button
            aria-label={dict.store.header.menu}
            onClick={() => setMenuOpen(true)}
            className="rounded-full p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      <CitySheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        currentCity={citySlug}
        conflict={totalItems > 0}
        cartCity={citySlug}
      />

      {/* Simple side drawer menu */}
      {menuOpen ? (
        <div className="fixed inset-0 z-40 mx-auto max-w-md">
          <button
            aria-label={dict.nav.closeMenuAria}
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-black/50"
          />
          <nav className="absolute inset-y-0 start-0 w-64 bg-white p-4 shadow-xl dark:bg-zinc-900">
            <div className="mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-50">
                <Wrench className="h-5 w-5 text-emerald-600" />
                {dict.brand}
              </span>
              <button
                onClick={() => setMenuOpen(false)}
                className="rounded-full p-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul className="space-y-1 text-sm">
              <li>
                <Link
                  href={`/${locale}/orders`}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-3 py-2 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  {dict.nav.myOrders}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/profile`}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-3 py-2 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  {dict.nav.profile}
                </Link>
              </li>
              {user ? (
                <li>
                  <Link
                    href={`/${locale}/cart`}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-3 py-2 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    {dict.nav.cart}
                  </Link>
                </li>
              ) : (
                <li>
                  <Link
                    href={`/${locale}/login?next=/${locale}/city/${citySlug}`}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-3 py-2 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    {dict.nav.signIn}
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </div>
      ) : null}
    </>
  );
}
