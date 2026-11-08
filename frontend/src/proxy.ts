// =====================================================================================
//  proxy.ts (called "middleware" before Next.js 16) runs on the server BEFORE a page renders.
//  Like an ASP.NET Core middleware / [Authorize] filter for pages:
//  anonymous users who open a protected page are redirected to /login.
//  The .NET API still validates the JWT on every write: this is only a UX convenience.
//  GUIDE: docs/guide/13-authentication.md
// =====================================================================================
import { NextResponse, type NextRequest } from "next/server";
import { TOKEN_COOKIE } from "@/lib/auth/session";

export function proxy(request: NextRequest) {
  const hasToken = request.cookies.has(TOKEN_COOKIE);
  if (hasToken) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("returnUrl", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

// Only these paths are protected. Everything else (lists, details) is public.
export const config = {
  matcher: ["/employees/new", "/employees/:id/edit", "/departments/new", "/departments/:id/edit"],
};
