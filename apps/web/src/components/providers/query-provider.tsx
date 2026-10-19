"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

/**
 * TanStack Query provider + toast notifications, mounted once in the
 * root `[lang]` layout so every page (store sections and the city
 * storefront alike) can use `useQuery` / `useMutation`.
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Storefront data changes with city switches; keep it fresh-ish.
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            fontFamily: "inherit",
            direction: "inherit",
          },
        }}
      />
    </QueryClientProvider>
  );
}
