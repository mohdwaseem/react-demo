// =====================================================================================
//  Root layout = _Layout.cshtml. Wraps EVERY page. {children} is like @RenderBody().
//  This is a Server Component (no "use client"): it renders on the server.
//  GUIDE: docs/guide/07-routing-and-rendering.md
// =====================================================================================
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import { Navbar } from "@/components/layout/Navbar";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// <title> and <meta> tags. Pages can override them with their own `metadata` export.
export const metadata: Metadata = {
  title: { default: "Employee Demo", template: "%s · Employee Demo" },
  description: "CRUD demo: Next.js + ASP.NET Core Web API + SQL Server",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-900">
        <Providers>
          <Navbar />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
          <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">
            Employee Demo v{process.env.NEXT_PUBLIC_APP_VERSION} · Next.js + ASP.NET Core
          </footer>
        </Providers>
      </body>
    </html>
  );
}
