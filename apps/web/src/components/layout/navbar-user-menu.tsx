"use client";

"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, LayoutDashboard, LogIn, LogOut, Package, UserRound } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";

/** Account dropdown: login/register links for guests, menu for signed-in users. */
export function NavbarUserMenu({ username }: { username: string | null }) {
  const { user, isAdmin, logout } = useAuth();
  const { dict, lp } = useI18n();
  const [open, setOpen] = useState(false);

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href={lp("/login")}>
            <LogIn className="h-4 w-4" /> {dict.nav.signIn}
          </Link>
        </Button>
        <Button size="sm" asChild>
          <Link href={lp("/register")}>{dict.nav.signUp}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-md border border-zinc-200 px-2.5 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        <span className="max-w-24 truncate">{username ?? dict.nav.account}</span>
        <ChevronDown className="h-3.5 w-3.5 opacity-60" />
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label={dict.nav.closeMenuAria}
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute end-0 z-20 mt-2 w-48 overflow-hidden rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            <p className="truncate px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400">
              {user.email}
            </p>
            <MenuLink href={lp("/profile")} icon={<UserRound className="h-4 w-4" />} onClick={() => setOpen(false)}>
              {dict.nav.profile}
            </MenuLink>
            <MenuLink href={lp("/orders")} icon={<Package className="h-4 w-4" />} onClick={() => setOpen(false)}>
              {dict.nav.myOrders}
            </MenuLink>
            {isAdmin ? (
              <MenuLink href={lp("/admin")} icon={<LayoutDashboard className="h-4 w-4" />} onClick={() => setOpen(false)}>
                {dict.nav.adminPanel}
              </MenuLink>
            ) : null}
            <div className="my-1 border-t border-zinc-200 dark:border-zinc-800" />
            <MenuLink href={lp("/")} icon={<LogOut className="h-4 w-4" />} onClick={logout} danger>
              {dict.nav.signOut}
            </MenuLink>
          </div>
        </>
      ) : null}
    </div>
  );
}

function MenuLink({
  href,
  icon,
  children,
  onClick,
  danger,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={
        danger
          ? "flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
          : "flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
      }
    >
      {icon}
      {children}
    </Link>
  );
}
