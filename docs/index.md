---
layout: home

hero:
  name: "React for .NET Developers"
  text: "From zero to a production CRUD app"
  tagline: You know SQL Server, ASP.NET Core and MVC. This guide teaches React and Next.js by building a real Employees & Departments app on top of a .NET Web API, then packaging it for release.
  image:
    src: /logo.svg
    alt: React + .NET
  actions:
    - theme: brand
      text: Start the guide →
      link: /guide/
    - theme: alt
      text: Run the demo in 5 minutes
      link: /guide/#run-the-finished-demo
    - theme: alt
      text: Build & package
      link: /guide/16-build-and-package

features:
  - icon: 🧭
    title: Explained in .NET terms
    details: Every concept is mapped to something you already know. layout.tsx ≈ _Layout.cshtml, package.json ≈ .csproj, useState ≈ a field that re-renders the view.
  - icon: 🗂️
    title: Every file explained
    details: What each generated file does, which file types exist (.ts, .tsx, .mjs, .env…), and how the folders map to URLs.
  - icon: 🔌
    title: Real API integration
    details: A typed fetch client, ProblemDetails error handling, CORS, environment variables, TanStack Query caching, Server Actions.
  - icon: 📝
    title: Forms done three ways
    details: Controlled inputs, React Hook Form + Zod, and Server Actions. Includes server-side validation errors mapped back to the fields.
  - icon: 🔐
    title: Intermediate cases included
    details: JWT login, protected routes, optimistic delete, concurrency conflicts (HTTP 409 + rowversion), debounced search, paging in the URL.
  - icon: 📦
    title: Build → Package → Deploy
    details: Versioned release zips, standalone Next.js output, framework-dependent vs self-contained .NET, SQL migration scripts, IIS, Docker and CI.
---

<div class="vp-doc" style="max-width: 1152px; margin: 48px auto 0; padding: 0 24px;">

## What you will build

<img class="screenshot" src="/images/employees-list.png" alt="Employee list with search, filters, sorting and paging" />
<p class="caption">The finished app: Next.js front end, ASP.NET Core API, SQL Server database.</p>

```mermaid
flowchart LR
  B["🌐 Browser<br/>React components"] -- "fetch JSON<br/>(Client Components)" --> API
  B -- "HTML / RSC stream" --- N["▲ Next.js server<br/>Server Components<br/>Server Actions"]
  N -- "fetch JSON<br/>(server → server)" --> API["🟣 ASP.NET Core API<br/>Controllers → Services"]
  API -- "EF Core" --> DB[("🗄️ SQL Server")]
```

</div>
