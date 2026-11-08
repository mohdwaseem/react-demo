// VitePress configuration for the developer guide.
// Run: cd docs && npm install && npm run docs:dev   → http://localhost:5173
import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";

const g = (file: string) => `/guide/${file}`;

export default withMermaid(
  defineConfig({
    title: "React for .NET Developers",
    description: "Build a full CRUD app with Next.js + ASP.NET Core Web API + SQL Server, from zero to production.",
    lang: "en-US",
    cleanUrls: true,
    lastUpdated: true,
    // Files under docs/ that are not pages
    srcExclude: ["**/node_modules/**"],
    // The build fails on broken internal links (good!). Links to the running demo
    // (http://localhost:3000 / :5080) are intentional, so only those are ignored.
    ignoreDeadLinks: [/^https?:\/\/localhost/],

    head: [["link", { rel: "icon", href: "/logo.svg" }]],

    markdown: {
      lineNumbers: true,
      theme: { light: "github-light", dark: "github-dark" },
    },

    themeConfig: {
      logo: "/logo.svg",
      siteTitle: "React for .NET Devs",

      nav: [
        { text: "Start here", link: g("") },
        { text: "Build & Deploy", link: g("16-build-and-package") },
        { text: "Glossary", link: g("18-glossary") },
        {
          text: "Run the demo",
          items: [
            { text: "Scalar API explorer", link: "http://localhost:5080/scalar" },
            { text: "Web app", link: "http://localhost:3000" },
          ],
        },
      ],

      sidebar: {
        "/guide/": [
          {
            text: "🚀 Start Here",
            items: [
              { text: "Welcome & learning path", link: g("") },
              { text: "1. Prerequisites & tooling", link: g("01-prerequisites-and-tooling") },
            ],
          },
          {
            text: "⚛️ React Basics",
            items: [
              { text: "2. JavaScript & TypeScript essentials", link: g("02-javascript-typescript-essentials") },
              { text: "3. React fundamentals", link: g("03-react-fundamentals") },
            ],
          },
          {
            text: "▲ Next.js",
            items: [
              { text: "4. Create a project from zero", link: g("04-create-nextjs-project-from-zero") },
              { text: "5. Project structure & every file", link: g("05-project-structure-and-files") },
              { text: "6. npm & package.json", link: g("06-package-management") },
              { text: "7. Routing & rendering", link: g("07-routing-and-rendering") },
            ],
          },
          {
            text: "🟣 Backend API",
            items: [{ text: "8. The .NET API walkthrough", link: g("08-backend-api-walkthrough") }],
          },
          {
            text: "🔌 Integration",
            items: [
              { text: "9. Calling the backend API", link: g("09-integrating-backend-apis") },
              { text: "10. Forms & validation", link: g("10-forms-and-validation") },
              { text: "11. CRUD end to end", link: g("11-crud-end-to-end") },
            ],
          },
          {
            text: "🧠 Advanced",
            items: [
              { text: "12. State management", link: g("12-state-management") },
              { text: "13. Authentication (JWT)", link: g("13-authentication") },
              { text: "14. Styling with Tailwind", link: g("14-styling-with-tailwind") },
              { text: "15. Debugging", link: g("15-debugging") },
            ],
          },
          {
            text: "📦 Build & Deploy",
            items: [
              { text: "16. Build & package a release", link: g("16-build-and-package") },
              { text: "16b. Deploy to IIS & Docker", link: g("16b-deploy-to-iis-and-docker") },
            ],
          },
          {
            text: "📚 Reference",
            items: [
              { text: "17. Troubleshooting & FAQ", link: g("17-troubleshooting-faq") },
              { text: "18. Glossary (React ↔ .NET)", link: g("18-glossary") },
            ],
          },
        ],
      },

      outline: { level: [2, 3], label: "On this page" },
      search: { provider: "local" },
      docFooter: { prev: "← Previous chapter", next: "Next chapter →" },
      lastUpdated: { text: "Last updated" },
      // To enable "Edit this page", push the repo and set your URL:
      // editLink: { pattern: "https://github.com/<you>/<repo>/edit/main/docs/:path" },
      footer: {
        message: "Demo stack: Next.js 16 · React 19 · TypeScript · ASP.NET Core 10 · EF Core · SQL Server",
      },
    },

    mermaid: { theme: "default" },

    // Mermaid is a big library; the size warning is expected for a docs site.
    vite: { build: { chunkSizeWarningLimit: 4000 } },
  }),
);
