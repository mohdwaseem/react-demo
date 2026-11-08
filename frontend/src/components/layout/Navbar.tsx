"use client";
// "use client" → this component runs in the browser because it needs
// useAuth() (React Context) and onClick handlers.
import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button, LinkButton } from "@/components/ui/Button";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/employees", label: "Employees" },
  { href: "/departments", label: "Departments" },
];

/** Pure rendering: highlights the link matching `pathname` (null = nothing highlighted). */
function NavLinkList({ pathname }: { pathname: string | null }) {
  const isActive = (href: string) =>
    pathname !== null && (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <ul className="flex gap-1">
      {links.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className={`rounded-md px-3 py-2 text-sm font-medium ${
              isActive(link.href) ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * usePathname() reads the URL, which is only known at request time.
 * With Cache Components it must sit inside <Suspense>: the prerendered HTML shows
 * the fallback (links without highlight), the browser then fills in the active link.
 */
function ActiveNavLinks() {
  return <NavLinkList pathname={usePathname()} />;
}

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
          <span className="grid size-8 place-items-center rounded-lg bg-indigo-600 text-sm text-white">ED</span>
          <span className="hidden sm:inline">Employee Demo</span>
        </Link>

        <Suspense fallback={<NavLinkList pathname={null} />}>
          <ActiveNavLinks />
        </Suspense>

        <div className="ml-auto flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden text-sm text-slate-600 sm:inline">
                👤 <b>{user.username}</b> ({user.role})
              </span>
              <Button variant="secondary" size="sm" onClick={logout}>Log out</Button>
            </>
          ) : (
            <LinkButton href="/login" size="sm">Log in</LinkButton>
          )}
        </div>
      </nav>
    </header>
  );
}
