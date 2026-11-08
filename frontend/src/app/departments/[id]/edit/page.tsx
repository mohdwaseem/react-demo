import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { departmentsApi } from "@/lib/api/departments";
import { ApiError } from "@/lib/api/client";
import { PageHeader } from "@/components/ui/Feedback";
import { DepartmentForm } from "@/components/departments/DepartmentForm";
import { updateDepartment } from "../../actions";

export const metadata: Metadata = { title: "Edit department" };

export default async function EditDepartmentPage({ params }: PageProps<"/departments/[id]/edit">) {
  const { id } = await params;
  const departmentId = Number(id);
  if (!Number.isInteger(departmentId) || departmentId <= 0) notFound();

  // Fetch on the server. A 404 from the API shows app/not-found.tsx.
  const department = await departmentsApi.get(departmentId).catch((err: unknown) => {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  });

  // .bind(null, id) creates a new Server Action with the id "baked in" (partial application).
  const action = updateDepartment.bind(null, departmentId);

  return (
    <>
      <PageHeader title={`Edit ${department.name}`} description={`${department.employeeCount} employee(s)`} />
      <DepartmentForm
        action={action}
        submitLabel="Save changes"
        initialValues={{ name: department.name, code: department.code, description: department.description ?? "" }}
      />
    </>
  );
}
