// =====================================================================================
//  Dashboard (route "/"). A SERVER Component that fetches data on the Next.js server.
//  The browser receives finished HTML: no loading spinner code, no API URL in the bundle.
//  GUIDE: docs/guide/07-routing-and-rendering.md#server-components
// =====================================================================================
import { Suspense } from "react";
import { dashboardApi } from "@/lib/api/misc";
import { formatCurrency } from "@/lib/format";
import { Card, PageHeader, Skeleton } from "@/components/ui/Feedback";
import { LinkButton } from "@/components/ui/Button";

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Live numbers from the .NET API"
        actions={<LinkButton href="/employees">View employees →</LinkButton>}
      />
      {/* The header above is sent immediately. The stats stream in when the API answers. */}
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardStats />
      </Suspense>
    </>
  );
}

/** An async component: only possible for Server Components. */
async function DashboardStats() {
  const stats = await dashboardApi.get(); // runs on the server; errors go to app/error.tsx
  const max = Math.max(1, ...stats.employeesByDepartment.map((d) => d.count));

  const tiles = [
    { label: "Employees", value: stats.totalEmployees, icon: "👥" },
    { label: "Active", value: stats.activeEmployees, icon: "✅" },
    { label: "Departments", value: stats.totalDepartments, icon: "🏢" },
    { label: "Average salary", value: formatCurrency(stats.averageSalary), icon: "💰" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiles.map((t) => (
          <Card key={t.label} className="p-5">
            <p className="text-sm text-slate-500">{t.icon} {t.label}</p>
            <p className="mt-2 text-2xl font-bold">{t.value}</p>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <h2 className="mb-4 font-semibold">Employees by department</h2>
        <ul className="space-y-3">
          {stats.employeesByDepartment.map((d) => (
            <li key={d.department} className="grid grid-cols-[10rem_1fr_3rem] items-center gap-3 text-sm">
              <span className="truncate text-slate-600">{d.department}</span>
              <span className="h-3 rounded-full bg-slate-100">
                <span className="block h-3 rounded-full bg-indigo-500" style={{ width: `${(d.count / max) * 100}%` }} />
              </span>
              <span className="text-right font-medium">{d.count}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-24" />)}
      </div>
      <Skeleton className="h-56" />
    </div>
  );
}
