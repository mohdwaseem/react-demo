# 2. JavaScript & TypeScript essentials

<div class="learn">

**What you'll learn**
- The modern JavaScript syntax you'll see in every React file
- How TypeScript types compare with C# types (and how they differ)
- `async/await` and Promises vs `Task`

<p class="meta">⏱ 45 minutes · Try the snippets in the browser console (F12) or in a <code>.ts</code> file</p>
</div>

## Variables: `const` and `let`

```ts
const name = "Aisha";   // can't be reassigned (like a readonly local)
let page = 1;           // can be reassigned
page = 2;
// var → old style, don't use it
```

Use `const` by default. React code is full of `const` because we rarely reassign; we create new values instead.

## Functions and arrow functions

```ts
// classic function
function add(a: number, b: number): number {
  return a + b;
}

// arrow function (like a C# lambda)
const add2 = (a: number, b: number) => a + b;

// used everywhere as callbacks
const names = employees.map((e) => e.firstName);   // = employees.Select(e => e.FirstName)
const active = employees.filter((e) => e.isActive); // = .Where(e => e.IsActive)
const total = employees.reduce((sum, e) => sum + e.salary, 0); // = .Sum(e => e.Salary)
```

| LINQ | JavaScript array method |
| --- | --- |
| `Select` | `map` |
| `Where` | `filter` |
| `FirstOrDefault` | `find` (returns `undefined` if none) |
| `Any` / `All` | `some` / `every` |
| `Aggregate` / `Sum` | `reduce` |
| `OrderBy` | `toSorted((a, b) => a.salary - b.salary)` |
| `Count()` | `.length` |

## Objects, destructuring and spread

```ts
const employee = { id: 1, firstName: "Omar", salary: 90000 };

// destructuring: pull properties into variables
const { firstName, salary } = employee;

// spread: copy an object and change one property (immutability!)
const raised = { ...employee, salary: 95000 };   // employee itself is unchanged

// arrays too
const ids = [1, 2, 3];
const more = [...ids, 4];          // [1, 2, 3, 4]
const [first, second] = ids;       // array destructuring
```

::: info 🟣 Coming from .NET
`{ ...employee, salary: 95000 }` is exactly C#'s `employee with { Salary = 95000 }` for records. React relies on this style heavily: **you never mutate state, you replace it with a new copy.**
:::

You'll see destructuring in **every component signature**:

```tsx
// props are one object; we destructure the parts we need
function Badge({ color, children }: { color: string; children: React.ReactNode }) { ... }
```

## Template strings, optional chaining, nullish coalescing

```ts
const url = `/api/employees/${id}`;          // = $"/api/employees/{id}"
const city = employee.address?.city;         // = employee.Address?.City
const phone = employee.phone ?? "—";         // = employee.Phone ?? "—"
const label = isActive ? "Active" : "Inactive";
```

::: warning `==` vs `===`
Always use `===` and `!==`. `==` performs surprising type conversions (`"1" == 1` is `true`).
:::

## Truthy & falsy

In `if (x)` the values `false, 0, "", null, undefined, NaN` count as false; everything else is true. React uses this for conditional rendering:

```tsx
{error && <ErrorAlert message={error} />}   // renders only if error is a non-empty string
```

## Modules: `import` / `export`

Every file is a **module**. Things are private to the file unless exported.

```ts
// lib/format.ts
export function formatCurrency(value: number) { ... }   // named export
export default function Page() { ... }                  // default export (one per file)

// another file
import { formatCurrency } from "@/lib/format";           // named import
import Page from "./page";                              // default import
import type { Employee } from "@/types/employee";        // type-only import (erased at build)
```

`@/` is an **alias** for `src/` (configured in `tsconfig.json`), so you never write `../../../`.

::: info 🟣 Coming from .NET
`export` ≈ `public`, a file ≈ a class/namespace, `import { X } from "..."` ≈ `using`. Next.js uses **default exports** for special files (`page.tsx`, `layout.tsx`).
:::

## Promises and `async/await`

```ts
// C#: async Task<Employee> GetAsync(int id)
async function getEmployee(id: number): Promise<Employee> {
  const response = await fetch(`http://localhost:5080/api/employees/${id}`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return (await response.json()) as Employee;
}

// run in parallel = Task.WhenAll
const [departments, user] = await Promise.all([getDepartments(), getUser()]);
```

| C# | JavaScript |
| --- | --- |
| `Task<T>` | `Promise<T>` |
| `await` | `await` (same!) |
| `Task.WhenAll` | `Promise.all` |
| `CancellationToken` | `AbortSignal` |
| `try/catch/finally` | `try/catch/finally` (same) |
| `HttpClient` | `fetch` (built into browsers and Node) |

## TypeScript types in 5 minutes

```ts
// interface = shape of an object (like a C# DTO class without behaviour)
interface Employee {
  id: number;                 // number = int, decimal, double… there's only one number type
  firstName: string;
  phone: string | null;       // union type = "string or null"  (like string?)
  hireDate: string;           // JSON has no Date type: dates arrive as strings
  department?: Department;    // ? = optional property (may be missing)
}

// type alias + union of literals = a C# enum, but as strings
type EmploymentType = "FullTime" | "PartTime" | "Contract" | "Intern";

// generics work like in C#
interface PagedResult<T> {
  items: T[];                 // T[] = List<T>
  totalCount: number;
}

// Record<K, V> = Dictionary<K, V>
const errors: Record<string, string> = { email: "Already used" };
```

<DotnetVsReact dotnetTitle="C# DTO (backend/…/Dtos/EmployeeDtos.cs)" reactTitle="TypeScript type (frontend/src/types/employee.ts)">
<template #dotnet>

```csharp
public class EmployeeDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = "";
    public string? Phone { get; set; }
    public DateOnly HireDate { get; set; }
    public decimal Salary { get; set; }
    public EmploymentType EmploymentType { get; set; }
}
```

</template>
<template #react>

```ts
export interface Employee {
  id: number;
  firstName: string;
  phone: string | null;
  hireDate: string;     // "2025-01-15"
  salary: number;
  employmentType: EmploymentType; // "FullTime" | ...
}
```

</template>
</DotnetVsReact>

::: danger Types are erased at runtime
TypeScript checks your code **at build time only**. `response.json() as Employee` does *not* validate the JSON. If the API sends something else, TypeScript won't know. That's why we validate user input with **Zod** (chapter 10) and why the API validates everything again.
:::

<details>
<summary><b>▶ Deep dive: <code>interface</code> vs <code>type</code>, <code>as const</code>, <code>typeof</code></b></summary>

- `interface` and `type` are almost interchangeable for object shapes. This repo uses `interface` for DTOs and `type` for unions.
- `as const` freezes a value's literal type:
  ```ts
  export const EMPLOYMENT_TYPES = ["FullTime", "PartTime", "Contract", "Intern"] as const;
  export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number]; // "FullTime" | "PartTime" | ...
  ```
  One array gives you both the runtime values (for a dropdown) and the compile-time type.
- `z.infer<typeof schema>` (chapter 10) generates a type from a validation schema, so there's one source of truth.

</details>

## Recap

- Arrow functions + `map/filter/find` are your LINQ.
- Spread (`{...obj}`) creates modified copies; React state is never mutated.
- `async/await` works like in C#; `Promise` ≈ `Task`.
- TypeScript interfaces mirror your C# DTOs, but types disappear at runtime.

## Try it yourself

Write a function `averageSalary(employees: Employee[]): number` that returns 0 for an empty array.

::: details Solution
```ts
function averageSalary(employees: Employee[]): number {
  if (employees.length === 0) return 0;
  return employees.reduce((sum, e) => sum + e.salary, 0) / employees.length;
}
```
:::

[Next: React fundamentals →](./03-react-fundamentals)
