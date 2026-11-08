"use client";
// =====================================================================================
//  React Context = a value every component below the Provider can read without passing
//  props through each level. Similar to a scoped service you inject in .NET.
//  GUIDE: docs/guide/12-state-management.md#context
// =====================================================================================
import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authApi } from "@/lib/api/misc";
import {
  TOKEN_COOKIE,
  UNAUTHORIZED_EVENT,
  USER_COOKIE,
  clearSession,
  parseUser,
  readCookie,
  saveSession,
  subscribeToSession,
} from "@/lib/auth/session";
import type { SessionUser } from "@/types/auth";

interface AuthContextValue {
  user: SessionUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // useSyncExternalStore reads a value that lives OUTSIDE React (here: document.cookie)
  // and re-renders when it changes. The 3rd argument is used during server rendering,
  // where there is no document: we render "logged out" and the browser corrects it.
  const token = useSyncExternalStore(subscribeToSession, () => readCookie(TOKEN_COOKIE), () => null);
  const rawUser = useSyncExternalStore(subscribeToSession, () => readCookie(USER_COOKIE), () => null);
  const user = useMemo(() => parseUser(rawUser), [rawUser]);

  const login = useCallback(async (username: string, password: string) => {
    const response = await authApi.login({ username, password }); // throws ApiError on 401
    saveSession(response);
    router.refresh(); // re-render Server Components that read the cookie
  }, [router]);

  const logout = useCallback(() => {
    clearSession();
    router.refresh();
  }, [router]);

  // An API call returned 401 (token expired/invalid) → clear the session and go to /login.
  // useEffect + addEventListener = subscribe after render; the cleanup unsubscribes.
  useEffect(() => {
    function handleUnauthorized() {
      clearSession();
      toast.error("Your session has expired. Please log in again.");
      router.push("/login?returnUrl=" + encodeURIComponent(window.location.pathname));
    }
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, isAuthenticated: !!token, login, logout }),
    [user, token, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Custom hook: `const { user, login } = useAuth();` */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
