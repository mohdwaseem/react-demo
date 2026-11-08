# 14. Styling with Tailwind

<div class="learn">

**What you'll learn**
- How utility-first CSS works and how to read a long `className`
- Responsive design, hover/focus states, conditional classes
- Turning repeated class lists into reusable components

<p class="meta">⏱ 25 minutes · Tailwind CSS v4 · Install the "Tailwind CSS IntelliSense" extension</p>
</div>

## Utility classes instead of a stylesheet

Instead of writing `.card { padding: 24px; border-radius: 12px; … }` in a CSS file, you compose small single-purpose classes in the markup:

```tsx
<div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">…</div>
```

| Class | CSS | |
| --- | --- | --- |
| `p-6` | `padding: 1.5rem` | spacing scale: 1 = 0.25rem |
| `px-4 py-2` | horizontal / vertical padding | |
| `mt-4`, `gap-3`, `space-y-4` | margins / gaps | |
| `rounded-xl` | `border-radius: 0.75rem` | |
| `border border-slate-200` | 1px border, light grey | colour scale 50–950 |
| `bg-white`, `text-slate-900` | background / text colour | |
| `text-sm font-medium` | font size / weight | |
| `flex items-center justify-between` | flexbox | |
| `grid grid-cols-2 lg:grid-cols-4` | CSS grid, 4 columns from the `lg` breakpoint | |
| `hidden sm:inline` | hidden on phones, inline from `sm` | |
| `hover:bg-slate-50` | style on hover | |
| `focus-visible:outline-2` | keyboard focus ring | |
| `disabled:opacity-60` | when the element is disabled | |
| `size-4` | width + height 1rem | |

::: info 🟣 Coming from .NET
If you've used Bootstrap (`btn btn-primary`, `mt-3`, `d-flex`) you already know the idea. Tailwind is lower-level: no pre-made components, just building blocks.
:::

## Setup (already done by create-next-app)

```css
/* src/app/globals.css */
@import "tailwindcss";

@theme inline {
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}
```

Tailwind v4 scans your files and generates only the classes you use. No `tailwind.config.js` is required.

## Responsive design: mobile first

Unprefixed classes apply to all sizes; `sm: md: lg: xl:` apply **from** that width up.

```tsx
// dashboard tiles: 2 columns on phones, 4 on large screens
<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
```

## Conditional classes

```tsx
// Navbar: highlight the active link
<Link className={`rounded-md px-3 py-2 text-sm font-medium ${
  isActive(link.href) ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100"
}`}>
```

::: warning Build class names from full strings
Tailwind finds classes by scanning your source text. `` `bg-${color}-600` `` won't work, because the generator never sees `bg-rose-600`. Use a lookup object instead, like `Button.tsx` does:

```ts
const variants = {
  primary: "bg-indigo-600 text-white hover:bg-indigo-700",
  danger: "bg-rose-600 text-white hover:bg-rose-700",
};
```
:::

## Reuse through components, not CSS classes

When the same class list appears 3 times, make a component. That's why the demo has `components/ui/`:

```tsx
// src/components/ui/Button.tsx (abridged)
export function Button({ variant = "primary", size = "md", isLoading, className = "", children, ...rest }: ButtonProps) {
  return (
    <button className={buttonClasses(variant, size, className)} disabled={rest.disabled || isLoading} {...rest}>
      {isLoading && <Spinner className="size-4" />}
      {children}
    </button>
  );
}

// usage everywhere
<Button variant="danger" isLoading={isPending} onClick={confirm}>Delete</Button>
```

::: tip Conflicting classes
If two classes set the same property (`w-full` and `w-auto`), **the order in the CSS file wins, not the order in `className`**. The demo hit this with filter dropdowns stretching full-width. The fix was a `fullWidth` prop on `Input/Select` instead of passing an overriding class. Libraries like `tailwind-merge` solve this generically.
:::

## Component libraries

The demo uses no UI library so the markup stays readable. In real projects you may add:

| Library | What it gives |
| --- | --- |
| **shadcn/ui** | copy-paste Tailwind components (dialog, table, form) you own |
| Headless UI / Radix | accessible behaviour (menus, dialogs) without styles |
| MUI, Ant Design, Fluent UI | complete styled component sets |

## Recap

- Compose small classes; read them left to right as "layout → spacing → colour → text → states".
- Mobile-first breakpoints: `sm:`, `md:`, `lg:`.
- Never build class names dynamically; use lookup tables.
- Extract repeated markup into components.

## Try it yourself

Make the employee table rows striped (every second row light grey).

::: details Solution
On the `<tr>`: `className="odd:bg-white even:bg-slate-50 hover:bg-indigo-50"`.
:::

[Next: Debugging →](./15-debugging)
