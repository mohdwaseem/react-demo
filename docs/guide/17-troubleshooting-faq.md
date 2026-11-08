# 17. Troubleshooting & FAQ

Search this page with **Ctrl+F**, or use the site search (top bar).

## Setup & running

::: details "Cannot reach the API. Is the .NET backend running on http://localhost:5080?"
- Start the API: `cd backend && dotnet run --project src/EmployeeDemo.Api`.
- Check `frontend/.env.development` points to the same port.
- If the API is up, open DevTools → Network: a CORS error means the origin isn't allowed (see below).
:::

::: details The API crashes on start-up with a SQL error
The connection string in `appsettings.json` must reach your SQL Server. For LocalDB use `Server=(localdb)\MSSQLLocalDB;…`. For a named instance: `Server=localhost\SQLEXPRESS;…`. Keep `TrustServerCertificate=True` for local development.
:::

::: details `dotnet ef` is not recognised
Run `dotnet tool restore` in `backend/`. The tool version is pinned in `dotnet-tools.json`.
:::

::: details Port 3000 / 5080 is already in use
Next.js: `npm run dev -- -p 3001`. API: change `applicationUrl` in `Properties/launchSettings.json`. Remember to update `.env.development` and `Cors:AllowedOrigins`.
:::

::: details I changed `.env.development` but nothing happened
Restart `npm run dev`. For production builds, `NEXT_PUBLIC_*` requires a **rebuild**.
:::

## CORS & HTTP

::: details "blocked by CORS policy: No 'Access-Control-Allow-Origin' header"
1. Origin listed exactly in `Cors:AllowedOrigins` (scheme + host + port)?
2. `app.UseCors()` before `UseAuthentication()`?
3. The API didn't crash (a 500 without CORS headers looks like a CORS error)?
4. Server Components/Actions never have CORS issues. If only the browser fails, it's CORS.
:::

::: details 401 Unauthorized on save
Your token expired (120 min) or you're not logged in. The app redirects to `/login` automatically. If it doesn't, check that the request has an `Authorization: Bearer …` header (Network tab).
:::

::: details 400 with `"$": ["… invalid start of a property name"]` and `"dto": ["The dto field is required."]`
The request body isn't valid JSON (often shell quoting in curl/PowerShell). The API couldn't deserialize it, so the whole DTO is "missing". Use the `.http` file or `Invoke-RestMethod -Body (@{…} | ConvertTo-Json)`.
:::

::: details 409 Conflict when saving an employee
Either the email is used by someone else (shown under the Email field), or the record changed since you opened it (banner → **Reload latest version**). That's optimistic concurrency working as designed.
:::

## React & Next.js

::: details "You're importing a component that needs useState / useEffect… It only works in a Client Component"
Add `"use client";` as the first line of that component's file, or move the interactive part into a separate Client Component.
:::

::: details "… encountered URL data / uncached data outside of `<Suspense>`" during `next build`
Cache Components requires request-time work to be inside a boundary. Wrap the component in `<Suspense fallback={…}>`, or add a `loading.tsx` to that route segment. See [chapter 7](./07-routing-and-rendering#cache-components).
:::

::: details Hydration mismatch warning
The server-rendered HTML differed from the first browser render. Typical causes: `Date.now()`/`Math.random()` during render, reading `window`/`localStorage`/cookies during render, locale-dependent formatting, invalid HTML nesting (`<div>` inside `<p>`), or **browser extensions** modifying the page. Move browser-only reads into `useEffect` or `useSyncExternalStore` with a server snapshot.
:::

::: details My list doesn't refresh after saving
- Client side: did the mutation `invalidateQueries` the right key? Open the TanStack devtools.
- Server side: did the Server Action call `revalidatePath()` for that page?
:::

::: details Clicking a label focuses the wrong input / tests find two inputs
Next.js keeps recently visited pages mounted but hidden, so hard-coded `id`s can exist twice. Generate ids with `useId()` (see `EmployeeForm.tsx`).
:::

::: details `params` is a Promise?
Yes, since Next.js 15. Use `const { id } = await params;` in Server Components, or `use(params)` in Client Components.
:::

::: details Why is my `useEffect` running twice in development?
React Strict Mode mounts components twice in development to reveal missing cleanups. It doesn't happen in production. Make sure your effect returns a cleanup function.
:::

## Build & deployment

::: details The deployed site has no CSS / JS (404 on `/_next/static/...`)
Copy `.next/static` into `standalone/.next/static` and `public` into `standalone/public`. `scripts/build-frontend.ps1` does this for you.
:::

::: details The production site calls `http://localhost:5080`
`NEXT_PUBLIC_API_BASE_URL` was baked in at build time. Rebuild with `./scripts/build-frontend.ps1 -ApiBaseUrl https://your-api`.
:::

::: details `npm audit` reports vulnerabilities
Read the report; check whether they're in `dependencies` (shipped) or dev tools. Don't run `npm audit fix --force` blindly. See [chapter 6](./06-package-management#security-npm-audit).
:::

::: details IIS shows HTTP Error 500.30 / 500.31 for the API
Install the ASP.NET Core Hosting Bundle matching .NET 10, check the app pool is "No Managed Code", enable `stdoutLogEnabled` temporarily and read the log.
:::

::: details "The process cannot access the file … because it is being used by another process" when packaging
A running `dotnet`/`node` process or a terminal whose current directory is inside `artifacts/` is locking files. Stop the servers and `cd` out of the folder.
:::

## Concepts

::: details Next.js vs plain React (Vite)?
Plain React + Vite builds a static SPA: all rendering in the browser, and you call the API with CORS. Next.js adds routing, server rendering, Server Actions and a production server. For an internal CRUD app either works; Next.js gives you more structure and server-side options. Everything in chapters 2–3 and most of 9–12 applies to both.
:::

::: details Should I move business logic into Next.js?
No. Keep business rules, validation and data access in the .NET API, so every client (web, mobile, integrations, RabbitMQ consumers) gets the same rules. Next.js is the UI layer (a "backend for frontend" at most).
:::

[Next: Glossary →](./18-glossary)
