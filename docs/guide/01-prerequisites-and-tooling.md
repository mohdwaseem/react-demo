# 1. Prerequisites & tooling

<div class="learn">

**What you'll learn**
- Which tools a React/Next.js developer installs and what each one does
- How Node.js and npm relate to the .NET runtime and the `dotnet` CLI
- The VS Code extensions and browser tools you'll use every day

<p class="meta">⏱ 20 minutes · No code yet</p>
</div>

## The toolbox at a glance

| Tool | What it is | .NET equivalent |
| --- | --- | --- |
| **Node.js** | A JavaScript runtime. Runs JS *outside* the browser (dev server, build tools, the Next.js server). | The .NET runtime |
| **npm** | Package manager + script runner that ships with Node. | NuGet + the `dotnet` CLI |
| **npx** | Runs a package's command without installing it globally. | `dotnet tool run` / `dnx` |
| **TypeScript** | JavaScript + static types. Compiled away before running. | C#'s type system (but erased at runtime) |
| **Next.js** | A React *framework*: routing, server rendering, bundling, a production server. | ASP.NET Core MVC (the framework around your views) |
| **React** | A *library* for building UI out of components. | Razor (the view engine) |
| **VS Code** | Editor. Works great for both C# (C# Dev Kit) and TS. | Visual Studio |

::: info 🟣 Coming from .NET
A browser can only run **JavaScript**. Node.js exists so the *tools* (and the Next.js server) can also run JavaScript on your machine/server, the same way `dotnet` runs your compiled C#.
:::

## 1. Install Node.js

Install the **LTS** version (22 or 24) from [nodejs.org](https://nodejs.org). This demo was built with **Node 24.22 / npm 11.19**.

::: code-group

```powershell [winget (Windows)]
winget install OpenJS.NodeJS.LTS
```

```powershell [nvm-windows (multiple versions)]
# https://github.com/coreybutler/nvm-windows
nvm install lts
nvm use lts
```

:::

Check it:

```powershell
node --version   # v24.x
npm --version    # 11.x
```

::: tip Several Node versions?
Like having several .NET SDKs side by side, **nvm-windows** (or `fnm`) lets you switch Node versions per project.
:::

## 2. .NET SDK and SQL Server

- **.NET SDK 10**: `dotnet --list-sdks` should list `10.0.x`.
- **SQL Server**: any edition works (Developer, Express, LocalDB). The demo uses `Server=localhost` with Windows authentication.
- **dotnet-ef**: you don't need to install it globally. The repo pins it in `backend/dotnet-tools.json`, so run `dotnet tool restore` once.

## 3. VS Code extensions

Open the repository folder in VS Code and accept **"Install recommended extensions"**. They are listed in `.vscode/extensions.json`:

| Extension | Why |
| --- | --- |
| C# Dev Kit | C# IntelliSense, debugging, test explorer |
| ESLint | shows lint errors in `.ts/.tsx` files as you type |
| Tailwind CSS IntelliSense | autocompletes class names like `bg-indigo-600` |
| Prettier | formats JS/TS/CSS/JSON on save |
| REST Client | run the requests in `EmployeeDemo.Api.http` |
| Vue (Volar) | only for editing this guide's custom components |
| SQL Server (mssql) | query the database from VS Code |

## 4. Browser developer tools

Press **F12** in Edge or Chrome. You'll live in three tabs:

| Tab | Use it to… |
| --- | --- |
| **Console** | see JavaScript errors and `console.log` output (like the Output window) |
| **Network** | inspect every API call: URL, status, request/response JSON, CORS errors |
| **Elements** | see the HTML React produced and the CSS applied |

Also install the **React Developer Tools** browser extension: it adds a *Components* tab to inspect props and state of each component (like the Locals window, but for UI).

## 5. Get the demo running

Follow [Run the finished demo](./#run-the-finished-demo) on the welcome page. You should see:

<img class="screenshot" src="/images/dashboard.png" alt="Dashboard" />
<p class="caption">http://localhost:3000. If you see numbers, the API and the database work.</p>

::: warning "Cannot reach the API" / "fetch failed"
The API must be running on **http://localhost:5080** *before* you open the web app. Check the first terminal for errors (usually the SQL Server connection string).
:::

## Recap

- **Node.js** runs JavaScript on your machine; **npm** installs packages and runs scripts.
- **React** is the view library; **Next.js** is the framework around it.
- Browser **DevTools → Network** will be your best friend for API debugging.

## Try it yourself

1. Open http://localhost:5080/scalar and call `GET /api/employees`.
2. Open http://localhost:3000/employees, press F12 → Network, type in the search box and watch the request to `/api/employees?search=...` appear.

::: details Answer: what did you see?
One request per pause in typing (not per key press). That's the **debounced search** you'll build in chapter 9. Click the request → *Response* shows the same JSON as in Scalar.
:::

[Next: JavaScript & TypeScript essentials →](./02-javascript-typescript-essentials)
