# 18. Glossary: React/Next.js ↔ .NET

Use the site search (top bar) or **Ctrl+F**.

## Language & tooling

| Term | .NET equivalent | Meaning |
| --- | --- | --- |
| Node.js | .NET runtime | Runs JavaScript outside the browser |
| npm | NuGet + `dotnet` CLI | Installs packages, runs scripts |
| npx | `dotnet tool run` | Runs a package's CLI without installing it |
| `package.json` | `.csproj` | Manifest: dependencies, scripts, version |
| `package-lock.json` | `packages.lock.json` | Exact resolved versions |
| `node_modules/` | NuGet package folder | Installed packages (per project) |
| devDependency | `PrivateAssets="all"` / build tool | Needed only to build/develop |
| TypeScript | C# type system | Static types for JavaScript, erased at runtime |
| `interface` / `type` | DTO class / record | Shape of an object |
| union type `"A" \| "B"` | `enum` | One of several literal values |
| `Promise<T>` | `Task<T>` | Async result |
| `AbortSignal` | `CancellationToken` | Cancel async work |
| module / `export` | public class / namespace | A file's public API |
| ESLint | Roslyn analyzers | Code-quality rules |
| Turbopack | MSBuild + compiler | Next.js' bundler/compiler |
| `.env` files | `appsettings.{Env}.json` | Configuration per environment |

## React

| Term | .NET equivalent | Meaning |
| --- | --- | --- |
| Component | Razor partial / View Component | A function returning UI |
| JSX / TSX | Razor syntax | HTML-like markup inside TS |
| Props | parameters / view model | Inputs passed from parent to child |
| `children` | `@RenderBody()` | Content between a component's tags |
| State (`useState`) | field + re-render | Memory that triggers a re-render when changed |
| Re-render | view re-execution | React calls the component again and patches the DOM |
| Hook | helper/service with UI state | `useXxx()` functions using React features |
| Custom hook | injected service | Your own reusable `useXxx()` |
| `useEffect` | event subscription + `Dispose` | Sync with something outside React |
| `useRef` | private field (no re-render) | Mutable value kept across renders |
| `useMemo` / `useCallback` | `Lazy<T>` / cached delegate | Memoise a value / function |
| Context | scoped DI service | Value available to all children of a Provider |
| Provider | DI registration | Component that supplies a Context value |
| Lifting state up | parent view model | Move state to the common parent |
| Controlled input | two-way binding | Input value comes from state |
| Uncontrolled input | plain form post | DOM keeps the value; read on submit |
| `key` | primary key | Identifies list items between renders |
| Fragment `<>…</>` | – | Group elements without a wrapper div |
| Hydration | – | Attaching React to server-rendered HTML in the browser |
| Strict Mode | – | Dev-only double rendering to find bugs |
| `<Suspense>` | – | Shows a fallback while children load |
| Transition (`useTransition`) | – | Mark an update as non-urgent; gives `isPending` |
| `useActionState` | `ModelState` round-trip | State returned by a form action |
| `<Activity>` | – | Keeps hidden UI mounted (used by Next.js navigation) |

## Next.js

| Term | .NET equivalent | Meaning |
| --- | --- | --- |
| App Router | routing + MVC | Folder-based routing in `app/` |
| `page.tsx` | action + view | UI for one URL |
| `layout.tsx` | `_Layout.cshtml` | Shared shell around pages |
| `loading.tsx` | – | Automatic `<Suspense>` fallback for a segment |
| `error.tsx` | `UseExceptionHandler` page | Error boundary for a segment |
| `not-found.tsx` | 404 page | Shown for unknown routes / `notFound()` |
| Dynamic segment `[id]` | `{id}` route parameter | Variable part of the URL |
| `params` / `searchParams` | route values / query string | URL data (Promises in Next 15+) |
| Server Component | Razor view rendered on server | Default; can `await` data; no JS shipped |
| Client Component | JS widget | `"use client"`; state, effects, events |
| Server Action | `[HttpPost]` action | `"use server"` function callable from forms/buttons |
| Route Handler (`route.ts`) | minimal API endpoint | HTTP endpoint inside Next.js |
| `proxy.ts` (formerly middleware) | ASP.NET Core middleware | Runs before matched requests |
| `revalidatePath` | output cache eviction | Re-render pages that show changed data |
| Cache Components | output caching opt-in | Fresh by default; cache with `"use cache"` |
| Partial Prerendering | – | Static shell + streamed dynamic parts |
| Streaming | chunked response | Send HTML progressively as data resolves |
| `output: "standalone"` | `dotnet publish` folder | Self-contained deployable server |
| `NEXT_PUBLIC_*` | – | Env var inlined into browser JS at build time |
| `<Link>` | `asp-action` tag helper | Client-side navigation with prefetch |
| `useRouter().push` | `RedirectToAction` | Navigate from code |

## Libraries in this demo

| Term | .NET equivalent | Meaning |
| --- | --- | --- |
| TanStack Query | `HttpClient` + `IMemoryCache` + Polly | Server-state cache for the UI |
| Query key | cache key | Identifies cached data |
| `useQuery` | GET via cached service | Read data with loading/error state |
| `useMutation` | POST/PUT/DELETE call | Write data with pending state |
| Invalidation | cache eviction | Mark cached data stale → refetch |
| Optimistic update | – | Update UI before the server confirms, roll back on error |
| React Hook Form | model binding | Form state & submission |
| Zod | DataAnnotations / FluentValidation | Schema validation + generated types |
| Sonner | TempData message + toast lib | Toast notifications |
| Tailwind CSS | Bootstrap utilities | Utility-first CSS classes |

## API & HTTP

| Term | Meaning |
| --- | --- |
| CORS | Browser rule: JS may read cross-origin responses only if the server allows the origin |
| Preflight | `OPTIONS` request the browser sends before "non-simple" cross-origin requests |
| ProblemDetails | RFC 7807/9457 JSON error format (`title`, `status`, `detail`, `errors`) |
| JWT | Signed token with claims, sent as `Authorization: Bearer …` |
| `rowversion` | SQL Server column that changes on every update → optimistic concurrency |
| BFF | Backend-for-Frontend: a server layer (here Next.js) between browser and APIs |

[← Back to the start](./)
