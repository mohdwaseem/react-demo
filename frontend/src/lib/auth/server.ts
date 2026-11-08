// Server-side helpers (Server Components, Server Actions). Uses next/headers, so never import
// this file from a Client Component.
import { cookies } from "next/headers";
import { TOKEN_COOKIE, USER_COOKIE, parseUser } from "./session";

export async function getServerToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(TOKEN_COOKIE)?.value ?? null;
}

export async function getServerUser() {
  const store = await cookies();
  const raw = store.get(USER_COOKIE)?.value;
  return parseUser(raw ? decodeURIComponent(raw) : null);
}
