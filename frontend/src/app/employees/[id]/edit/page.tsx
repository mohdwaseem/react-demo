// /employees/123/edit (protected by src/proxy.ts)
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditEmployee } from "@/components/employees/EditEmployee";

export const metadata: Metadata = { title: "Edit employee" };

export default async function EditEmployeePage({ params }: PageProps<"/employees/[id]/edit">) {
  const { id } = await params;
  const employeeId = Number(id);
  if (!Number.isInteger(employeeId) || employeeId <= 0) notFound();

  return <EditEmployee id={employeeId} />;
}
