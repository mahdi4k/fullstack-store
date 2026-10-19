import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { serverLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localePath } from "@/lib/i18n/config";

export async function Footer() {
  const locale = await serverLocale();
  const dict = getDictionary(locale);

  const LINKS = [
    { href: localePath(locale, "/products"), label: dict.footer.shop },
    { href: localePath(locale, "/categories"), label: dict.footer.categories },
    { href: localePath(locale, "/orders"), label: dict.footer.orders },
    { href: "http://localhost:3000/api/docs", label: dict.footer.apiDocs, external: true },
  ];

  return (
    <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          <ShoppingBag className="h-4 w-4" /> {dict.brand}
        </div>
        <nav className="flex gap-5 text-sm text-zinc-500 dark:text-zinc-400">
          {LINKS.map((link) =>
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                {link.label}
              </Link>
            )
          )}
        </nav>
        <p className="text-xs text-zinc-400">{dict.footer.builtWith}</p>
      </div>
    </footer>
  );
}
