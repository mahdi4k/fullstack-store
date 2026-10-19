"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  clearAuth,
  getStoredToken,
  storeAuth,
  updateStoredUser,
} from "@/lib/auth-store";
import { useI18n } from "@/components/providers/locale-provider";
import type { AuthResponse, User } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  /** True while the stored token is being validated on first load. */
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (
    email: string,
    password: string,
    name?: string
  ) => Promise<User>;
  logout: () => void;
  updateLocalUser: (user: User) => void;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

/**
 * Holds the JWT session. On first mount the stored token is validated
 * against `GET /auth/profile`; invalid tokens log the user out automatically.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();
  const { lp, dict } = useI18n();

  // Validate the stored token on first load.
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = getStoredToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const profile = await api<User>("/auth/profile", { token });
        if (!cancelled) setUser(profile);
      } catch {
        clearAuth();
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api<AuthResponse>("/auth/login", {
      method: "POST",
      body: { email, password },
      token: null,
    });
    storeAuth(res.accessToken, res.user);
    setUser(res.user);
    return res.user;
  };

  const register = async (email: string, password: string, name?: string) => {
    const res = await api<AuthResponse>("/auth/register", {
      method: "POST",
      body: { email, password, ...(name ? { name } : {}) },
      token: null,
    });
    storeAuth(res.accessToken, res.user);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    clearAuth();
    setUser(null);
    router.push(lp("/"));
  };

  const updateLocalUser = (updated: User) => {
    updateStoredUser(updated);
    setUser(updated);
  };

  const value: AuthContextValue = {
    user,
    loading,
    isAdmin: user?.role === "ADMIN",
    login,
    register,
    logout,
    updateLocalUser,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Access the auth context. Throws if used outside `AuthProvider`. */
export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

/**
 * Pages protected by authentication. Shows a spinner, then redirects
 * unauthenticated visitors to `/login?next=...`.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { dict, lp } = useI18n();

  React.useEffect(() => {
    if (!loading && !user) {
      router.replace(`${lp("/login")}?next=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [loading, user, router, lp]);

  if (loading || !user) {
    return (
      <div className="flex justify-center py-24" aria-busy>
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100" />
      </div>
    );
  }
  return <>{children}</>;
}

/**
 * Pages protected by the ADMIN role. Non-admin users see an access-denied card.
 */
export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const { dict, lp } = useI18n();

  React.useEffect(() => {
    if (!loading && !user) {
      router.replace(`${lp("/login")}?next=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [loading, user, router, lp]);

  if (loading || !user) {
    return (
      <div className="flex justify-center py-24" aria-busy>
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100" />
      </div>
    );
  }
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md py-24 text-center">
        <h2 className="text-xl font-semibold">{dict.auth.accessDeniedTitle}</h2>
        <p className="mt-2 text-sm text-zinc-500">
          {dict.auth.accessDeniedText}
        </p>
      </div>
    );
  }
  return <>{children}</>;
}
