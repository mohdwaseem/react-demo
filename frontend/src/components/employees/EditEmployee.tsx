"use client";
import { useEmployee } from "@/hooks/useEmployees";
import { ApiError } from "@/lib/api/client";
import { EmptyState, ErrorAlert, PageHeader } from "@/components/ui/Feedback";
import { LinkButton } from "@/components/ui/Button";
import { PageSpinner } from "@/components/ui/Spinner";
import { EmployeeForm } from "./EmployeeForm";

/** Loads the employee, then shows the shared form pre-filled with its values. */
export function EditEmployee({ id }: { id: number }) {
  const { data: employee, isPending, error, refetch } = useEmployee(id);

  if (isPending) return <PageSpinner label="Loading employee..." />;
  if (error instanceof ApiError && error.status === 404) {
    return <EmptyState title="Employee not found" action={<LinkButton href="/employees">Back to list</LinkButton>} />;
  }
  if (error) return <ErrorAlert message={error.message} />;

  return (
    <>
      <PageHeader title={`Edit ${employee.fullName}`} description="Changes are saved to SQL Server through the .NET API." />
      {/* key = rowVersion: when a newer version is loaded, React re-creates the form with fresh values */}
      <EmployeeForm key={employee.rowVersion} employee={employee} onReloadRequested={() => refetch()} />
    </>
  );
}
