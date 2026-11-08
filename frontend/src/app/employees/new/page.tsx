// /employees/new (protected by src/proxy.ts → anonymous users go to /login)
import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/Feedback";
import { EmployeeForm } from "@/components/employees/EmployeeForm";

export const metadata: Metadata = { title: "New employee" };

export default function NewEmployeePage() {
  return (
    <>
      <PageHeader title="New employee" description="Fields marked * are required." />
      <EmployeeForm />
    </>
  );
}
