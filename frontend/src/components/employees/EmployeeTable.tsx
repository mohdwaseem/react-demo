"use client";
// A "presentational" component: it only receives data + callbacks through props and renders.
// It doesn't fetch anything, which makes it easy to reuse and test.
import Link from "next/link";
import type { Employee, SortDir, SortField } from "@/types/employee";
import { formatCurrency, formatDate, formatEmploymentType } from "@/lib/format";
import { Badge } from "@/components/ui/Feedback";
import { Button, LinkButton } from "@/components/ui/Button";
import { AuthOnly } from "@/components/auth/AuthOnly";

const columns: { field?: SortField; label: string; className?: string }[] = [
  { field: "name", label: "Name" },
  { field: "department", label: "Department" },
  { label: "Type" },
  { field: "hireDate", label: "Hire date" },
  { field: "salary", label: "Salary", className: "text-right" },
  { label: "Status" },
  { label: "", className: "text-right" },
];

export function EmployeeTable({ employees, sortBy, sortDir, onSort, onDelete }: {
  employees: Employee[];
  sortBy: SortField;
  sortDir: SortDir;
  onSort: (field: SortField) => void;
  onDelete: (employee: Employee) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((col) => (
              <th key={col.label} scope="col" className={`px-4 py-3 text-left font-semibold text-slate-600 ${col.className ?? ""}`}>
                {col.field ? (
                  <button className="inline-flex items-center gap-1 hover:text-indigo-600" onClick={() => onSort(col.field!)}>
                    {col.label}
                    <span className="text-xs">{sortBy === col.field ? (sortDir === "asc" ? "▲" : "▼") : "↕"}</span>
                  </button>
                ) : (
                  col.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {/* key = stable unique id. React uses it to know which row is which between renders. */}
          {employees.map((e) => (
            <tr key={e.id} className="hover:bg-slate-50">
              <td className="px-4 py-3">
                <Link href={`/employees/${e.id}`} className="font-medium text-slate-900 hover:text-indigo-600">
                  {e.fullName}
                </Link>
                <div className="text-xs text-slate-500">{e.email}</div>
              </td>
              <td className="px-4 py-3 text-slate-600">{e.departmentName}</td>
              <td className="px-4 py-3"><Badge color="indigo">{formatEmploymentType(e.employmentType)}</Badge></td>
              <td className="px-4 py-3 text-slate-600">{formatDate(e.hireDate)}</td>
              <td className="px-4 py-3 text-right font-mono">{formatCurrency(e.salary)}</td>
              <td className="px-4 py-3">
                {e.isActive ? <Badge color="green">Active</Badge> : <Badge>Inactive</Badge>}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1">
                  <LinkButton href={`/employees/${e.id}`} variant="ghost" size="sm">View</LinkButton>
                  <AuthOnly>
                    <LinkButton href={`/employees/${e.id}/edit`} variant="ghost" size="sm">Edit</LinkButton>
                    <Button variant="ghost" size="sm" className="text-rose-600" onClick={() => onDelete(e)}>Delete</Button>
                  </AuthOnly>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
