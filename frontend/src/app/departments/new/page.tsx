import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/Feedback";
import { DepartmentForm } from "@/components/departments/DepartmentForm";
import { createDepartment } from "../actions";

export const metadata: Metadata = { title: "New department" };

export default function NewDepartmentPage() {
  return (
    <>
      <PageHeader title="New department" />
      {/* Passing a Server Action to a Client Component as a prop */}
      <DepartmentForm action={createDepartment} submitLabel="Create department" />
    </>
  );
}
