// =====================================================================================
//  /departments: the "server-first" approach (compare with /employees):
//   - data is fetched in a Server Component (runs on the Next.js server)
//   - create/update/delete go through Server Actions (actions.ts)
//  Fewer moving parts in the browser, very close to classic MVC.
// =====================================================================================
import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { departmentsApi } from "@/lib/api/departments";
import { getServerUser } from "@/lib/auth/server";
import { formatDate } from "@/lib/format";
import { Card, EmptyState, PageHeader, Skeleton } from "@/components/ui/Feedback";
import { LinkButton } from "@/components/ui/Button";
import { AuthOnly } from "@/components/auth/AuthOnly";
import { DeleteDepartmentButton } from "@/components/departments/DeleteDepartmentButton";

export const metadata: Metadata = { title: "Departments" };

export default function DepartmentsPage() {
  return (
    <>
      <PageHeader
        title="Departments"
        description="Rendered on the server; changes use Server Actions."
        actions={
          <AuthOnly>
            <LinkButton href="/departments/new">+ Add department</LinkButton>
          </AuthOnly>
        }
      />
      <Suspense fallback={<Skeleton className="h-72" />}>
        <DepartmentTable />
      </Suspense>
    </>
  );
}

async function DepartmentTable() {
  // Both run on the server, in parallel. getServerUser() reads the auth cookie.
  const [departments, user] = await Promise.all([departmentsApi.list(), getServerUser()]);

  if (departments.length === 0) {
    return <Card><EmptyState title="No departments yet" /></Card>;
  }

  return (
    <Card className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-slate-600">
          <tr>
            <th className="px-4 py-3 font-semibold">Code</th>
            <th className="px-4 py-3 font-semibold">Name</th>
            <th className="px-4 py-3 font-semibold">Description</th>
            <th className="px-4 py-3 text-right font-semibold">Employees</th>
            <th className="px-4 py-3 font-semibold">Created</th>
            {user && <th className="px-4 py-3" />}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {departments.map((d) => (
            <tr key={d.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-mono font-semibold text-indigo-700">{d.code}</td>
              <td className="px-4 py-3 font-medium">{d.name}</td>
              <td className="px-4 py-3 text-slate-600">{d.description ?? "—"}</td>
              <td className="px-4 py-3 text-right">
                <Link href={`/employees?departmentId=${d.id}`} className="text-indigo-600 hover:underline">
                  {d.employeeCount}
                </Link>
              </td>
              <td className="px-4 py-3 text-slate-600">{formatDate(d.createdAt)}</td>
              {user && (
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <LinkButton href={`/departments/${d.id}/edit`} variant="ghost" size="sm">Edit</LinkButton>
                    {/* A Client Component inside a Server Component: only this button ships JS */}
                    <DeleteDepartmentButton id={d.id} name={d.name} employeeCount={d.employeeCount} />
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
