# React for .NET Developers: Employee CRUD Demo

[![build](https://github.com/mohdwaseem/react-demo/actions/workflows/build.yml/badge.svg?branch=main)](https://github.com/mohdwaseem/react-demo/actions/workflows/build.yml?query=branch%3Amain)
[![API test coverage](https://raw.githubusercontent.com/mohdwaseem/react-demo/badges/coverage.svg)](https://github.com/mohdwaseem/react-demo/actions/workflows/build.yml?query=branch%3Amain)

A complete, working reference app for developers who know **SQL Server, ASP.NET Core and MVC** and want to learn **React / Next.js**, with a step-by-step developer guide.

| Layer | Tech |
| --- | --- |
| UI | **Next.js 16** (App Router, Server Components, Server Actions), **React 19**, **TypeScript**, Tailwind CSS 4, TanStack Query, React Hook Form + Zod |
| API | **ASP.NET Core 10** Web API (controllers), EF Core 10, JWT, ProblemDetails, OpenAPI + Scalar |
| Database | **SQL Server** (code-first migrations, seed data, `rowversion` concurrency) |
| Docs | **VitePress** site with diagrams, side-by-side .NET ↔ React comparisons, search |
| Release | PowerShell build scripts → versioned zips, SQL migration script/bundle, IIS & Docker configs, GitHub Actions |

## Quick start

Prerequisites: .NET SDK 10, Node.js 22+ (24 recommended), SQL Server reachable as `localhost` with Windows auth (change the connection string in `backend/src/EmployeeDemo.Api/appsettings.json` if needed).

```powershell
# 1) API: creates + seeds the database on first run
cd backend
dotnet tool restore
dotnet run --project src/EmployeeDemo.Api          # http://localhost:5080/scalar

# 2) Web (second terminal)
cd frontend
npm install
npm run dev                                         # http://localhost:3000   login: admin / Admin@123

# 3) Developer guide (optional, third terminal)
cd docs
npm install
npm run docs:dev                                    # http://localhost:5173
```

Or press **F5 → "Full stack (API + Next.js + browser)"** in VS Code.

## 📘 The developer guide

Start at **[docs/guide/index.md](docs/guide/index.md)** (best viewed with `npm run docs:dev`).

1. Prerequisites & tooling · 2. JavaScript & TypeScript essentials · 3. React fundamentals
4. Create a Next.js project from zero · 5. Project structure & **every file** · 6. npm & package.json
7. Routing & rendering (Server vs Client Components) · 8. The .NET API walkthrough
9. **Calling the backend API** · 10. Forms & validation · 11. CRUD end to end
12. State management · 13. Authentication (JWT) · 14. Tailwind · 15. Debugging
16. **Build & package a release** · 16b. Deploy to IIS & Docker · 17. Troubleshooting · 18. Glossary

## What's covered

- List with debounced search, filters, sorting, paging (state in the URL)
- Create/edit with one shared form, client + server validation, server errors mapped to fields
- Optimistic delete with rollback, confirm dialogs, toasts, loading/empty/error states
- Optimistic concurrency (SQL `rowversion` → HTTP 409 → "reload latest")
- Server-rendered pages + Server Actions (departments) vs client-side fetching (employees)
- JWT login, protected pages (`proxy.ts`) and endpoints (`[Authorize]`), global 401 handling
- Integration tests (xUnit + WebApplicationFactory), ESLint, type-check

## Build a release

```powershell
./scripts/package-all.ps1 -ApiBaseUrl https://api.mycompany.com
# → artifacts/EmployeeDemo-api-1.0.0.zip, EmployeeDemo-web-1.0.0.zip, EmployeeDemo-db-1.0.0.zip, release-info.json
```

See [chapter 16](docs/guide/16-build-and-package.md) and [16b](docs/guide/16b-deploy-to-iis-and-docker.md).

## Repository layout

```
backend/    ASP.NET Core API + tests
frontend/   Next.js app
docs/       developer guide (VitePress)
scripts/    build-backend.ps1, build-frontend.ps1, package-all.ps1
deploy/     IIS web.config files, Dockerfiles, docker-compose.yml, Windows service helper
.github/    CI workflow
.vscode/    debug configurations, recommended extensions
```
