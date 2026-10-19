"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/components/providers/locale-provider";
import { useCart } from "@/components/providers/cart-provider";
import { NavbarSearch } from "./navbar-search";
import { NavbarUserMenu } from "./navbar-user-menu";
import { LocaleSwitcher } from "./locale-switcher";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { dict, lp } = useI18n();
  const pathname = usePathname();
  const { user } = useAuth();

  const LINKS = [
    { href: "/products", label: dict.nav.shop },
    { href: "/categories", label: dict.nav.categories },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-7">
          <Link
            href={lp("/")}
            className="flex items-center gap-2.5 font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
              <ShoppingBag className="h-5 w-5" />
            </span>
            {dict.brand}
          </Link>

          <nav className="hidden items-center gap-1 sm:flex">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={lp(link.href)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  pathname.startsWith(lp(link.href))
                    ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <NavbarSearch />
          <Link
            href={lp("/cart")}
            aria-label={dict.nav.cartAria}
            className="relative flex h-9 items-center rounded-md px-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <ShoppingBag className="h-4 w-4" />
            {user ? <NavbarCartBadge /> : null}
          </Link>
          <NavbarUserMenu username={user?.name ?? user?.email ?? null} />
        </div>
      </div>
    </header>
  );
}

function NavbarCartBadge() {
  const { totalItems } = useCart();
  if (totalItems === 0) return null;
  return <NavbarCartCount count={totalItems} />;
}

function NavbarCartCount({ count }: { count: number }) {
  return (
    <span className="absolute -top-1.5 end-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}
