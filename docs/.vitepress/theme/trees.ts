// Data for <FileTree name="..." />. depth = indentation level; link = chapter/section to jump to.
export interface TreeNode {
  path: string;
  depth: number;
  note?: string;
  link?: string;
}

const ch = (file: string, hash = "") => `/guide/${file}${hash ? "#" + hash : ""}`;

export const trees: Record<string, TreeNode[]> = {
  // What `npx create-next-app` generates (before we add anything)
  generated: [
    { path: "frontend/", depth: 0, note: "the project root (= the folder with the .csproj in .NET)" },
    { path: ".next/", depth: 1, note: "build output, generated, never edit or commit (= bin/ + obj/)", link: ch("05-project-structure-and-files", "next-folder") },
    { path: "node_modules/", depth: 1, note: "installed packages, generated (= the NuGet cache, but per project)", link: ch("05-project-structure-and-files", "node-modules") },
    { path: "public/", depth: 1, note: "static files served as-is: /logo.png → public/logo.png (= wwwroot)", link: ch("05-project-structure-and-files", "public") },
    { path: "src/", depth: 1, note: "all your source code" },
    { path: "app/", depth: 2, note: "the App Router: folders = URLs", link: ch("07-routing-and-rendering") },
    { path: "favicon.ico", depth: 3, note: "browser tab icon" },
    { path: "globals.css", depth: 3, note: "global styles + Tailwind import (= site.css)", link: ch("14-styling-with-tailwind") },
    { path: "layout.tsx", depth: 3, note: "root layout wrapping every page (= _Layout.cshtml)", link: ch("05-project-structure-and-files", "layout-tsx") },
    { path: "page.tsx", depth: 3, note: 'the home page "/" (= Views/Home/Index.cshtml)', link: ch("05-project-structure-and-files", "page-tsx") },
    { path: ".gitignore", depth: 1, note: "files git must not track" },
    { path: "AGENTS.md", depth: 1, note: "hints for AI coding assistants (re-added by next dev)" },
    { path: "eslint.config.mjs", depth: 1, note: "linter rules (= .editorconfig + Roslyn analyzers)", link: ch("05-project-structure-and-files", "eslint-config-mjs") },
    { path: "next-env.d.ts", depth: 1, note: "generated TypeScript declarations for Next.js, don't edit" },
    { path: "next.config.ts", depth: 1, note: "framework settings (= Program.cs options)", link: ch("05-project-structure-and-files", "next-config-ts") },
    { path: "package.json", depth: 1, note: "project manifest: dependencies + scripts (= .csproj)", link: ch("06-package-management") },
    { path: "package-lock.json", depth: 1, note: "exact resolved versions (= packages.lock.json)", link: ch("06-package-management", "package-lock-json") },
    { path: "README.md", depth: 1, note: "generated readme" },
    { path: "tsconfig.json", depth: 1, note: "TypeScript compiler options (= <PropertyGroup> in .csproj)", link: ch("05-project-structure-and-files", "tsconfig-json") },
  ],

  // The finished frontend of this repository
  frontend: [
    { path: "frontend/", depth: 0 },
    { path: ".env.development", depth: 1, note: "env vars for npm run dev (non-secret, committed)", link: ch("09-integrating-backend-apis", "environment-variables") },
    { path: ".env.production", depth: 1, note: "env vars for npm run build / start" },
    { path: ".env.example", depth: 1, note: "documents every variable; copy to .env.local" },
    { path: "next.config.ts", depth: 1, note: "standalone output, version, cache components" },
    { path: "src/", depth: 1 },
    { path: "proxy.ts", depth: 2, note: "runs before pages: redirects anonymous users to /login (= middleware)", link: ch("13-authentication", "protecting-pages-with-proxy-ts") },
    { path: "app/", depth: 2, note: "ROUTES", link: ch("07-routing-and-rendering") },
    { path: "layout.tsx", depth: 3, note: "html/body + Providers + Navbar + footer" },
    { path: "providers.tsx", depth: 3, note: '"use client": QueryClient, AuthProvider, Toaster' },
    { path: "page.tsx", depth: 3, note: "/ dashboard (Server Component + Suspense)" },
    { path: "error.tsx", depth: 3, note: "error boundary for the whole app" },
    { path: "not-found.tsx", depth: 3, note: "404 page" },
    { path: "employees/", depth: 3, note: "client-side data fetching (TanStack Query)" },
    { path: "page.tsx", depth: 4, note: "/employees list" },
    { path: "new/page.tsx", depth: 4, note: "/employees/new" },
    { path: "[id]/page.tsx", depth: 4, note: "/employees/42 details (dynamic segment)" },
    { path: "[id]/loading.tsx", depth: 4, note: "instant loading UI" },
    { path: "[id]/edit/page.tsx", depth: 4, note: "/employees/42/edit" },
    { path: "departments/", depth: 3, note: "server-side fetching + Server Actions" },
    { path: "page.tsx", depth: 4, note: "/departments list (async Server Component)" },
    { path: "actions.ts", depth: 4, note: '"use server" create / update / delete', link: ch("07-routing-and-rendering", "server-actions") },
    { path: "new/page.tsx", depth: 4 },
    { path: "[id]/edit/page.tsx", depth: 4 },
    { path: "login/page.tsx", depth: 3, note: "/login" },
    { path: "components/", depth: 2, note: "reusable UI pieces (= partial views / view components)" },
    { path: "ui/", depth: 3, note: "Button, FormField, Pagination, ConfirmDialog, ..." },
    { path: "layout/Navbar.tsx", depth: 3 },
    { path: "employees/", depth: 3, note: "EmployeesView, EmployeeTable, EmployeeForm, ..." },
    { path: "departments/", depth: 3, note: "DepartmentForm, DeleteDepartmentButton" },
    { path: "auth/", depth: 3, note: "LoginForm, AuthOnly" },
    { path: "context/AuthContext.tsx", depth: 2, note: "who is logged in, login(), logout()", link: ch("12-state-management", "context") },
    { path: "hooks/", depth: 2, note: "custom hooks: useEmployees, useDepartments, useDebouncedCallback" },
    { path: "lib/", depth: 2, note: "plain TypeScript, no UI" },
    { path: "api/client.ts", depth: 3, note: "THE fetch wrapper: base URL, JWT, ProblemDetails → ApiError", link: ch("09-integrating-backend-apis", "the-api-client") },
    { path: "api/employees.ts", depth: 3, note: "one function per endpoint" },
    { path: "api/departments.ts", depth: 3 },
    { path: "auth/session.ts", depth: 3, note: "token cookie helpers" },
    { path: "validation/", depth: 3, note: "Zod schemas (= DataAnnotations)", link: ch("10-forms-and-validation") },
    { path: "format.ts", depth: 3, note: "currency / date helpers" },
    { path: "types/", depth: 2, note: "TypeScript interfaces that mirror the C# DTOs" },
  ],

  backend: [
    { path: "backend/", depth: 0 },
    { path: "EmployeeDemo.slnx", depth: 1, note: "solution file (new XML .slnx format)" },
    { path: "dotnet-tools.json", depth: 1, note: "local tool manifest → dotnet-ef pinned per repo" },
    { path: "src/EmployeeDemo.Api/", depth: 1, link: ch("08-backend-api-walkthrough") },
    { path: "Program.cs", depth: 2, note: "DI registrations + middleware pipeline", link: ch("08-backend-api-walkthrough", "program-cs") },
    { path: "Controllers/", depth: 2, note: "EmployeesController, DepartmentsController, AuthController, DashboardController" },
    { path: "Services/", depth: 2, note: "business logic (EmployeeService, DepartmentService, AuthService)" },
    { path: "Entities/", depth: 2, note: "EF Core entities = tables" },
    { path: "Dtos/", depth: 2, note: "request/response shapes + DataAnnotations" },
    { path: "Data/", depth: 2, note: "AppDbContext, DbSeeder, Migrations/" },
    { path: "Infrastructure/", depth: 2, note: "GlobalExceptionHandler, exceptions, mapping" },
    { path: "appsettings*.json", depth: 2, note: "configuration per environment" },
    { path: "EmployeeDemo.Api.http", depth: 2, note: "try requests from the editor" },
    { path: "tests/EmployeeDemo.Api.Tests/", depth: 1, note: "xUnit integration tests (WebApplicationFactory)" },
  ],

  repo: [
    { path: "ReactDemo/", depth: 0 },
    { path: "backend/", depth: 1, note: "ASP.NET Core 10 Web API + EF Core + tests", link: ch("08-backend-api-walkthrough") },
    { path: "frontend/", depth: 1, note: "Next.js 16 + React 19 + TypeScript", link: ch("05-project-structure-and-files") },
    { path: "docs/", depth: 1, note: "this guide (VitePress)" },
    { path: "scripts/", depth: 1, note: "build-backend.ps1, build-frontend.ps1, package-all.ps1", link: ch("16-build-and-package") },
    { path: "deploy/", depth: 1, note: "IIS web.config files, Dockerfiles, docker-compose", link: ch("16b-deploy-to-iis-and-docker") },
    { path: ".github/workflows/build.yml", depth: 1, note: "CI pipeline", link: ch("16-build-and-package", "ci") },
    { path: ".vscode/", depth: 1, note: "F5 debugging for API + Next.js together", link: ch("15-debugging") },
    { path: "version.json", depth: 1, note: "release version used by the scripts" },
  ],
};
