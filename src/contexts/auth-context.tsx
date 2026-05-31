"use client";

import {
  SessionProvider,
  signIn,
  signOut,
  useSession,
} from "next-auth/react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import type { AuthUser } from "@/lib/types";

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  isHydrated: boolean;
  isLoadingUser: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function AuthContextProvider({ children }: { children: ReactNode }) {
  const { data: session, status, update } = useSession();

  const login = useCallback(async (email: string, password: string) => {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (result?.ok) {
      return;
    }
    if (result?.code === "admin_only") {
      throw new Error("ADMIN_ONLY");
    }
    throw new Error(result?.error ?? "Sign-in failed");
  }, []);

  const logout = useCallback(() => {
    void signOut({ redirect: false });
  }, []);

  const refreshUser = useCallback(async () => {
    await update();
  }, [update]);

  const user = useMemo((): AuthUser | null => {
    if (!session?.user?.email || !session.user.id) {
      return null;
    }
    return {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
    };
  }, [session]);

  const value = useMemo(
    (): AuthContextValue => ({
      token: session?.accessToken ?? null,
      user,
      isHydrated: status !== "loading",
      isLoadingUser: status === "loading",
      login,
      logout,
      refreshUser,
    }),
    [session, user, status, login, logout, refreshUser],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthContextProvider>{children}</AuthContextProvider>
    </SessionProvider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
