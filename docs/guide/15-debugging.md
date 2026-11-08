# 15. Debugging

<div class="learn">

**What you'll learn**
- Debug the .NET API and the Next.js app together with breakpoints (F5)
- Where server-side vs client-side logs appear
- The browser tools: Network, Console, React DevTools, TanStack Query devtools

<p class="meta">⏱ 25 minutes · Files: <code>.vscode/launch.json</code>, <code>.vscode/tasks.json</code></p>
</div>

## Where does my code run?

This decides where logs show up and which debugger to attach.

| Code | Runs in | `console.log` appears in |
| --- | --- | --- |
| Server Component, Server Action, `proxy.ts` | Node.js (Next.js server) | the **terminal** running `npm run dev` |
| Client Component (`"use client"`), hooks, event handlers | the **browser** (+ once on the server for the first HTML) | browser **DevTools Console** (and sometimes the terminal) |
| .NET API | Kestrel | the `dotnet run` terminal / VS Code Debug Console |

## F5: full-stack debugging in VS Code

`.vscode/launch.json` contains a compound configuration:

```json
"compounds": [
  {
    "name": "Full stack (API + Next.js + browser)",
    "configurations": [".NET API", "Next.js: server-side", "Next.js: browser (Edge)"],
    "stopAll": true
  }
]
```

1. Run and Debug panel (Ctrl+Shift+D) → choose **Full stack** → **F5**.
2. Set breakpoints in:
   - `EmployeeService.cs` → C# debugger
   - `app/departments/actions.ts` → Node debugger (server-side)
   - `EmployeeForm.tsx` `onSubmit` → browser debugger (Edge)
3. Submit a form and step through all three.

::: tip Just one side?
Pick ".NET API" alone, or "Next.js: server-side" alone. Or put a `debugger;` statement in client code and open DevTools: the browser stops there.
:::

## Browser DevTools

### Network tab

Filter by **Fetch/XHR**. For each call to `localhost:5080` check:
- **Headers**: URL, method, status, `Authorization` header present?
- **Payload**: the JSON you sent
- **Response**: the JSON / ProblemDetails returned
- An `OPTIONS` request before a `POST` = CORS preflight (chapter 8)

### Console

React warnings (missing `key`, hydration mismatch) and your `console.log` output. Errors link to the source line thanks to source maps.

### React DevTools (Components tab)

Select a component to see its **props, state and hooks** live, and edit them. "Highlight updates" shows which components re-render.

### TanStack Query devtools

The floating logo at the bottom-right (dev only). Lists every query key, its status (fresh / stale / fetching), and the cached data. Use it when "the list didn't refresh after saving".

### Next.js dev overlay

The **N** badge at the bottom-left shows build/runtime errors and Next.js "issues" (like a missing `<Suspense>` boundary) with suggested fixes.

## Common errors, decoded

| Message | Meaning | Fix |
| --- | --- | --- |
| `Cannot reach the API. Is the .NET backend running…` | network error / API down / CORS | start the API; see chapter 9 |
| `Hydration failed… server rendered HTML didn't match the client` | first render differs between server and browser (`Date.now()`, `window`, locale formatting) | compute browser-only values in `useEffect`, or use `useSyncExternalStore` with a server snapshot |
| `… encountered URL data … outside of <Suspense>` | Cache Components needs a boundary | wrap in `<Suspense>` or add `loading.tsx` |
| `useAuth must be used inside <AuthProvider>` | component rendered outside the provider | check `providers.tsx` wraps it |
| `Rendered more hooks than during the previous render` | a hook inside an `if` | move hooks to the top |
| `Each child in a list should have a unique "key" prop` | `.map()` without `key` | add `key={item.id}` |
| `You're importing a component that needs useState… mark it "use client"` | hook in a Server Component | add `"use client"` to that file |

## Logging the generated SQL

`appsettings.Development.json` enables EF Core command logging, so every SQL statement appears in the API terminal, handy to check paging (`OFFSET … FETCH`) and filters.

## Recap

- Server code logs to the terminal, client code to the browser console.
- F5 → **Full stack** debugs C#, Node and browser together.
- Network tab + ProblemDetails responses answer most "why didn't it save?" questions.

[Next: Build & package a release →](./16-build-and-package)
