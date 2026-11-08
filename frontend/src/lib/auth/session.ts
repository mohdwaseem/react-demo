// =====================================================================================
//  Where the JWT lives in the browser.
//
//  We store it in a cookie (not httpOnly) so that:
//   - Client Components can read it and send "Authorization: Bearer ..." to the .NET API
//   - Server Components / Server Actions can read the same cookie with next/headers cookies()
//   - proxy.ts can redirect anonymous users away from protected pages
//
//  Trade-off: JavaScript can read this cookie (same risk as localStorage if the site has an XSS bug).
//  Production upgrade path (httpOnly cookie + BFF proxy) is explained in
//  GUIDE: docs/guide/13-authentication.md
// =====================================================================================
import type { LoginResponse, SessionUser } from "@/types/auth";

export const TOKEN_COOKIE = "ed_token";
export const USER_COOKIE = "ed_user";

// ---------- tiny "store" so React components re-render when the session changes ----------
const listeners = new Set<() => void>();

export function subscribeToSession(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify() {
  listeners.forEach((l) => l());
}

// ---------- cookie helpers (browser only) ----------
export function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.split("; ").find((c) => c.startsWith(name + "="));
  return match ? decodeURIComponent(match.substring(name.length + 1)) : null;
}

function writeCookie(name: string, value: string, maxAgeSeconds: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
}

export function saveSession(login: LoginResponse) {
  const maxAge = Math.max(0, Math.floor((new Date(login.expiresAt).getTime() - Date.now()) / 1000));
  const user: SessionUser = { username: login.username, role: login.role };
  writeCookie(TOKEN_COOKIE, login.token, maxAge);
  writeCookie(USER_COOKIE, JSON.stringify(user), maxAge);
  notify();
}

export function clearSession() {
  writeCookie(TOKEN_COOKIE, "", 0);
  writeCookie(USER_COOKIE, "", 0);
  notify();
}

// ---------- "session expired" signal ----------
// Code outside React (the TanStack Query cache) can't navigate. It fires this browser event
// instead, and AuthProvider (inside React, with access to the router) handles it.
export const UNAUTHORIZED_EVENT = "auth:unauthorized";

export function signalUnauthorized() {
  window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
}

export function parseUser(raw: string | null): SessionUser | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}
