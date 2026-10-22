"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ShoppingCart,
  Menu,
  MapPin,
  ChevronDown,
  Wrench,
  X,
  Car,
} from "lucide-react";
import { useI18n } from "@/components/providers/locale-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { CitySheet } from "./city-sheet";
import { VehicleSheet } from "./vehicle-sheet";
import { useCart } from "@/components/providers/cart-provider";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface StorefrontHeaderProps {
  citySlug: string;
  cityName: string;
  /** Current car model (cookie), null = show everything. */
  car?: string | null;
  /** Car models available in this city (for the switch sheet). */
  vehicles?: string[];
}

/**
 * Slide-in menu drawer with smooth open/close transitions.
 * Anchored to the viewport start edge (not a centered column), so it
 * looks right on desktop too.
 */
export function MenuDrawer({
  open,
  onClose,
  titled,
  children,
}: {
  open: boolean;
  onClose: () => void;
  titled: React.ReactNode;
  children: React.ReactNode;
}) {
  const { locale } = useI18n();
  // Off-screen position follows the reading direction: the drawer sits
  // at inline-start (right in RTL), so it slides out to the right there.
  const drawerHidden = locale === "fa" ? "translate-x-full" : "-translate-x-full";
  const [rendered, setRendered] = React.useState(open);
  const [visible, setVisible] = React.useState(false);

  // Mount → next frame make visible (slides in); on close reverse.
  React.useEffect(() => {
    if (open) {
      setRendered(true);
      const raf = requestAnimationFrame(() =>
        requestAnimationFrame(() => setVisible(true))
      );
      return () => cancelAnimationFrame(raf);
    }
    setVisible(false);
    const timer = setTimeout(() => setRendered(false), 300);
    return () => clearTimeout(timer);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!rendered) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop (fades) */}
      <button
        aria-label="close"
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-black/50 transition-opacity duration-300",
          visible ? "opacity-100" : "opacity-0"
        )}
      />
      {/* Panel slides from the viewport start edge */}
      <nav
        className={cn(
          "absolute inset-y-0 start-0 flex w-72 max-w-[85vw] flex-col bg-white p-4 shadow-2xl transition-transform duration-300 ease-out md:w-80 dark:bg-zinc-900",
          visible
            ? "translate-x-0"
            // hidden: off-screen start edge (left in LTR, right in RTL)
            : drawerHidden
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          {titled}
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </nav>
    </div>
  );
}

/**
 * Sticky translucent storefront header: back, sticky city badge,
 * selected car badge, cart count badge, and a slide-in menu drawer.
 */
export function StorefrontHeader({
  citySlug,
  cityName,
  car = null,
  vehicles = [],
}: StorefrontHeaderProps) {
  const { dict, locale } = useI18n();
  // Off-screen position follows the reading direction: the drawer sits
  // at inline-start (right in RTL), so it slides out to the right there.
  const drawerHidden = locale === "fa" ? "translate-x-full" : "-translate-x-full";
  const router = useRouter();
  const { user } = useAuth();
  const { totalItems } = useCart();
  const [cityOpen, setCityOpen] = React.useState(false);
  const [carOpen, setCarOpen] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-zinc-200/70 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/90">
        <div className="mx-auto flex h-14 max-w-md items-center gap-2 px-4 md:max-w-xl">
          <button
            aria-label={dict.store.header.back}
            onClick={() => router.back()}
            className="rounded-full p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <ArrowRight className="h-5 w-5 rtl:-scale-x-100" />
          </button>

          {/* City badge — opens the city switch sheet */}
          <button
            onClick={() => setCityOpen(true)}
            className="flex items-center gap-0.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
          >
            <MapPin className="h-3.5 w-3.5" />
            {cityName}
            <ChevronDown className="h-3 w-3 opacity-60" />
          </button>

          {vehicles.length > 0 ? (
            <button
              onClick={() => setCarOpen(true)}
              className="flex items-center gap-0.5 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              <Car className="h-3.5 w-3.5" />
              {car ?? dict.store.header.allCars}
            </button>
          ) : null}

          <div className="flex-1" />

          {/* Cart with count badge */}
          <button
            onClick={() => router.push(`/${locale}/cart`)}
            aria-label={dict.store.header.cart}
            className="relative rounded-full p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <ShoppingCart className="h-5 w-5 rtl:-scale-x-100" />
            {totalItems > 0 ? (
              <span className="absolute -top-0.5 start-6 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white">
                {totalItems}
              </span>
            ) : null}
          </button>

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
        open={cityOpen}
        onClose={() => setCityOpen(false)}
        currentCity={citySlug}
        conflict={totalItems > 0}
        cartCity={citySlug}
      />

      <VehicleSheet
        open={carOpen}
        onClose={() => setCarOpen(false)}
        vehicles={vehicles}
        currentCar={car}
      />

      <MenuDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        titled={
          <span className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-50">
            <Wrench className="h-5 w-5 text-emerald-600" />
            {dict.brand}
          </span>
        }
      >
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
      </MenuDrawer>
    </>
  );
}
