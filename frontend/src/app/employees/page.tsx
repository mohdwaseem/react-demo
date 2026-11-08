// =====================================================================================
//  /employees: the list page. The page itself is a tiny Server Component; the interactive
//  part (search, filters, sorting, paging, delete) is the Client Component <EmployeesView />.
//  GUIDE: docs/guide/11-crud-end-to-end.md
// =====================================================================================
import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/ui/Feedback";
import { LinkButton } from "@/components/ui/Button";
import { PageSpinner } from "@/components/ui/Spinner";
import { AuthOnly } from "@/components/auth/AuthOnly";
import { EmployeesView } from "@/components/employees/EmployeesView";

export const metadata: Metadata = { title: "Employees" };

export default function EmployeesPage() {
  return (
    <>
      <PageHeader
        title="Employees"
        description="Search, filter, sort and page through employees. Data is fetched in the browser with TanStack Query."
        actions={
          <AuthOnly>
            <LinkButton href="/employees/new">+ Add employee</LinkButton>
          </AuthOnly>
        }
      />
      {/* EmployeesView reads the URL (?search=..&page=..) with useSearchParams → needs a Suspense boundary */}
      <Suspense fallback={<PageSpinner label="Loading employees..." />}>
        <EmployeesView />
      </Suspense>
    </>
  );
}
