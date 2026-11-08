# 4. Create a Next.js project from zero

<div class="learn">

**What you'll learn**
- How to scaffold a Next.js + TypeScript + Tailwind project and what every prompt means
- How to run it, and what happens when you save a file
- How the demo was grown from the empty template, step by step

<p class="meta">⏱ 30 minutes · Do this in an empty folder (e.g. <code>C:\Dev\playground</code>) so you don't overwrite the demo</p>
</div>

::: info 🟣 Coming from .NET
`npx create-next-app` is the equivalent of `dotnet new mvc -o MyApp`. It creates the project folder, writes starter files and restores packages in one go.
:::

## Step 1: Scaffold

```powershell
npx create-next-app@latest my-app
```

`npx` downloads the latest `create-next-app` tool, runs it once, and throws it away. You'll be asked:

```txt
What is your project named? my-app
Would you like to use the recommended Next.js defaults?
  ❯ Yes, use recommended defaults   ← TypeScript, ESLint, Tailwind, App Router, Cache Components
    No, reuse previous settings
    No, customize settings
```

If you choose **customize**, here's what each question means and what this demo picked:

| Prompt | Demo answer | What it means |
| --- | --- | --- |
| Use TypeScript? | **Yes** | `.ts/.tsx` files + type checking. Always say yes. |
| Which linter? | **ESLint** | Code-quality rules (`npm run lint`), like Roslyn analyzers. |
| Use React Compiler? | No | Experimental auto-memoization. Not needed to learn. |
| Use Tailwind CSS? | **Yes** | Utility CSS classes (`p-4 bg-white`). See chapter 14. |
| Code inside `src/`? | **Yes** | Keeps config files at the root and code in `src/`. Like having a `src/` folder in a .NET solution. |
| Use App Router? | **Yes** | The modern router (`app/` folder). The older "Pages Router" (`pages/`) is legacy. |
| Use Cache Components? | **Yes** | Next.js 16 default: data is fetched fresh unless you opt into caching. See chapter 7. |
| Customize import alias? | No (`@/*`) | `import x from "@/lib/x"` instead of `../../lib/x`. |
| Include AGENTS.md? | Yes | Hints for AI coding assistants. Harmless. |

The demo's exact command (non-interactive) was:

```powershell
npx create-next-app@latest frontend --typescript --eslint --tailwind --app --src-dir --import-alias "@/*" --use-npm --yes
```

::: tip Version used by this guide
`create-next-app` installed **Next.js 16.4.5**, **React 19.3.0**, **TypeScript 5.9**, **Tailwind CSS 4.3**, **ESLint 9**. Newer minor versions should work the same.
:::

## Step 2: Run it

```powershell
cd my-app
npm run dev
```

```txt
▲ Next.js 16.4.5 (Turbopack)
- Local:   http://localhost:3000
✓ Ready in 1.2s
```

Open http://localhost:3000, then edit `src/app/page.tsx`, change some text and save. The browser updates **instantly without losing state**. That's **Fast Refresh** (hot reload, like `dotnet watch` but faster and per component).

| Command | What it does | .NET equivalent |
| --- | --- | --- |
| `npm run dev` | dev server with hot reload, unminified, detailed errors | `dotnet watch run` |
| `npm run build` | production build into `.next/` (type-check + bundle + prerender) | `dotnet publish -c Release` |
| `npm run start` | run the production build | `dotnet MyApp.dll` |
| `npm run lint` | run ESLint | build with analyzers |

These names come from the `"scripts"` section of `package.json` (chapter 6).

## Step 3: Clean the template

The template's `page.tsx` is a marketing page. Replace it with something minimal:

```tsx
// src/app/page.tsx
export default function HomePage() {
  return <h1 className="p-8 text-3xl font-bold">Hello from Next.js 👋</h1>;
}
```

and delete the sample SVGs in `public/` if you don't use them.

## Step 4: Add the packages the demo uses

```powershell
npm install @tanstack/react-query react-hook-form zod @hookform/resolvers sonner
npm install -D @tanstack/react-query-devtools
```

| Package | Why we need it | .NET analogy |
| --- | --- | --- |
| `@tanstack/react-query` | fetch + cache + refetch server data, loading/error state | `HttpClient` + `IMemoryCache` + Polly, for the UI |
| `react-hook-form` | fast form state handling | model binding |
| `zod` | schema validation, types generated from schemas | DataAnnotations / FluentValidation |
| `@hookform/resolvers` | plugs Zod into React Hook Form | a validator adapter |
| `sonner` | toast notifications | TempData + a toast JS lib |
| `@tanstack/react-query-devtools` *(dev)* | inspect the query cache in the browser | the Diagnostic Tools window |

`-D` means **devDependency**: needed only while developing/building (chapter 6).

## Step 5: Add folders for your code

```powershell
mkdir src/components, src/lib/api, src/hooks, src/types, src/context
```

| Folder | Put here… |
| --- | --- |
| `src/app/` | routes only: `page.tsx`, `layout.tsx`, `loading.tsx`, … (chapter 7) |
| `src/components/` | reusable UI (partial views) |
| `src/lib/` | plain TS: API client, formatting, validation (no UI) |
| `src/hooks/` | custom hooks (`useEmployees`) |
| `src/types/` | TypeScript interfaces mirroring the API DTOs |
| `src/context/` | React Context providers (current user) |

This layout is a **convention**, not something Next.js enforces. Only `app/` (and `public/`) are special.

## Step 6: Environment variables

Create `.env.development` in the project root:

```ini
NEXT_PUBLIC_API_BASE_URL=http://localhost:5080
API_BASE_URL=http://localhost:5080
```

Restart `npm run dev` after changing env files. Chapter 9 explains the `NEXT_PUBLIC_` prefix.

## Step 7: Your first API call

```tsx
// src/app/page.tsx: a Server Component, fetching on the server
import { Suspense } from "react";

export default function HomePage() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">Departments</h1>
      <Suspense fallback={<p>Loading…</p>}>
        <DepartmentList />
      </Suspense>
    </main>
  );
}

async function DepartmentList() {
  const res = await fetch(`${process.env.API_BASE_URL}/api/departments`);
  const departments: { id: number; name: string }[] = await res.json();
  return (
    <ul className="mt-4 list-disc pl-6">
      {departments.map((d) => <li key={d.id}>{d.name}</li>)}
    </ul>
  );
}
```

Start the API (`dotnet run` in `backend/`) and reload. You just rendered SQL Server data with React. 🎉

::: warning Why the `<Suspense>`?
With Cache Components (the Next.js 16 default), a component that fetches fresh data must be inside a `<Suspense>` boundary (or a route with `loading.tsx`). Otherwise the dev overlay shows a **"blocking route"** issue and `next build` fails with an error that ends in *"…outside of `<Suspense>`"*. This is explained in chapter 7.
:::

## How the demo grew from here

The commits of a real project would look roughly like this. Each step maps to a chapter:

1. `types/` + `lib/api/client.ts`: typed API client (ch. 9)
2. `app/layout.tsx` + `providers.tsx` + `Navbar`: app shell (ch. 7, 12)
3. `app/departments`: server-rendered list + Server Actions (ch. 7, 10)
4. `app/employees`: client list with TanStack Query (ch. 9)
5. `EmployeeForm`: React Hook Form + Zod (ch. 10)
6. Details, edit, delete with optimistic update (ch. 11)
7. `AuthContext`, `LoginForm`, `proxy.ts` (ch. 13)
8. `loading.tsx`, `error.tsx`, `not-found.tsx` polish (ch. 7)
9. `output: "standalone"` + build scripts (ch. 16)

## Recap

- `npx create-next-app@latest` scaffolds everything; pick TypeScript, ESLint, Tailwind, App Router, `src/`.
- `npm run dev` for development, `npm run build` + `npm run start` for production.
- Only `src/app` is special to Next.js; the other folders are your own conventions.

## Try it yourself

Add a page at `/about` that shows "About this demo".

::: details Solution
Create `src/app/about/page.tsx`:
```tsx
export default function AboutPage() {
  return <h1 className="p-8 text-2xl">About this demo</h1>;
}
```
The folder name `about` *is* the URL. No route registration needed.
:::

[Next: Project structure & every file →](./05-project-structure-and-files)
