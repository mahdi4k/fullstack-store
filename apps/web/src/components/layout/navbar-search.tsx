"use client";

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useI18n } from "@/components/providers/locale-provider";
import { Input } from "@/components/ui/input";

/** Compact search box in the navbar; submits to the catalog page. */
export function NavbarSearch() {
  const router = useRouter();
  const { dict, lp } = useI18n();
  const [term, setTerm] = React.useState("");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const query = term.trim();
    router.push(
      query ? `${lp("/products")}?search=${encodeURIComponent(query)}` : lp("/products")
    );
  };

  return (
    <form onSubmit={submit} className="hidden md:block" role="search">
      <div className="relative">
        <Search className="pointer-events-none absolute start-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
        <Input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder={dict.nav.searchPlaceholder}
          className="h-8 w-48 ps-8 text-xs"
          aria-label={dict.nav.searchAria}
        />
      </div>
    </form>
  );
}
