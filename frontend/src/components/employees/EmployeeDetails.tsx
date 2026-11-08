"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDeleteEmployee, useEmployee } from "@/hooks/useEmployees";
import { ApiError } from "@/lib/api/client";
import { formatCurrency, formatDate, formatEmploymentType } from "@/lib/format";
import { Badge, Card, EmptyState, ErrorAlert, PageHeader } from "@/components/ui/Feedback";
import { Button, LinkButton } from "@/components/ui/Button";
import { PageSpinner } from "@/components/ui/Spinner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { AuthOnly } from "@/components/auth/AuthOnly";

export function EmployeeDetails({ id }: { id: number }) {
  const router = useRouter();
  const { data: employee, isPending, error } = useEmployee(id);
  const deleteMutation = useDeleteEmployee();
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Early returns for each state: loading → error/404 → data.
  if (isPending) return <PageSpinner label="Loading employee..." />;
  if (error instanceof ApiError && error.status === 404) {
    return (
      <EmptyState
        title="Employee not found"
        message={`There is no employee with id ${id}.`}
        action={<LinkButton href="/employees">Back to list</LinkButton>}
      />
    );
  }
  if (error) return <ErrorAlert message={error.message} />;

  const rows: [string, React.ReactNode][] = [
    ["Email", <a key="email" href={`mailto:${employee.email}`} className="text-indigo-600 hover:underline">{employee.email}</a>],
    ["Phone", employee.phone ?? "—"],
    ["Department", employee.departmentName],
    ["Employment type", formatEmploymentType(employee.employmentType)],
    ["Hire date", formatDate(employee.hireDate)],
    ["Salary", formatCurrency(employee.salary)],
    ["Created", formatDate(employee.createdAt)],
    ["Last updated", formatDate(employee.updatedAt)],
  ];

  return (
    <>
      <PageHeader
        title={employee.fullName}
        description={`Employee #${employee.id}`}
        actions={
          <>
            <LinkButton href="/employees" variant="secondary">← Back</LinkButton>
            <AuthOnly>
              <LinkButton href={`/employees/${employee.id}/edit`}>Edit</LinkButton>
              <Button variant="danger" onClick={() => setConfirmOpen(true)}>Delete</Button>
            </AuthOnly>
          </>
        }
      />

      <Card className="p-6">
        <div className="mb-4">
          {employee.isActive ? <Badge color="green">Active</Badge> : <Badge>Inactive</Badge>}
        </div>
        <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">{label}</dt>
              <dd className="mt-1 text-slate-900">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete employee?"
        message={<>This will permanently delete <b>{employee.fullName}</b>.</>}
        isLoading={deleteMutation.isPending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() =>
          deleteMutation.mutate(employee.id, {
            onSuccess: () => {
              toast.success(`${employee.fullName} was deleted.`);
              router.push("/employees");
            },
            onError: (err) => {
              setConfirmOpen(false);
              toast.error(err.message);
            },
          })
        }
      />
    </>
  );
}
