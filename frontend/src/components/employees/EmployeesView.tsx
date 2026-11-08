"use client";
// =====================================================================================
//  The interactive employee list.
//  The filter/sort/page state lives in the URL (?search=ali&page=2), so:
//   - refresh keeps your filters, - you can bookmark/share a filtered list,
//   - the browser Back button works.
// =====================================================================================
import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useDeleteEmployee, useEmployeeList } from "@/hooks/useEmployees";
import { ApiError } from "@/lib/api/client";
import type { Employee, EmployeeQuery, SortDir, SortField } from "@/types/employee";
import { Card, EmptyState, ErrorAlert } from "@/components/ui/Feedback";
import { Button } from "@/components/ui/Button";
import { PageSpinner } from "@/components/ui/Spinner";
import { Pagination } from "@/components/ui/Pagination";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmployeeFilters } from "./EmployeeFilters";
import { EmployeeTable } from "./EmployeeTable";

/** Turns the URL query string into a typed EmployeeQuery object. */
function readQuery(params: URLSearchParams): EmployeeQuery {
  const num = (key: string) => (params.get(key) ? Number(params.get(key)) : undefined);
  const active = params.get("isActive");
  return {
    search: params.get("search") ?? undefined,
    departmentId: num("departmentId"),
    isActive: active === "true" ? true : active === "false" ? false : undefined,
    sortBy: (params.get("sortBy") as SortField) ?? "name",
    sortDir: (params.get("sortDir") as SortDir) ?? "asc",
    page: num("page") ?? 1,
    pageSize: num("pageSize") ?? 10,
  };
}

export function EmployeesView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = readQuery(searchParams);

  // ---- server state (TanStack Query) ----
  const { data, isPending, isError, error, isFetching, refetch } = useEmployeeList(query);
  const deleteMutation = useDeleteEmployee();

  // ---- local UI state ----
  const [toDelete, setToDelete] = useState<Employee | null>(null);

  /** Merge changes into the URL. Changing a filter resets to page 1. */
  function updateQuery(changes: Partial<Record<keyof EmployeeQuery, string | number | boolean | undefined>>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value === undefined || value === "") next.delete(key);
      else next.set(key, String(value));
    }
    if (!("page" in changes)) next.delete("page");
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  function handleSort(field: SortField) {
    const dir: SortDir = query.sortBy === field && query.sortDir === "asc" ? "desc" : "asc";
    updateQuery({ sortBy: field, sortDir: dir });
  }

  function confirmDelete() {
    if (!toDelete) return;
    const employee = toDelete;
    setToDelete(null); // close the dialog right away: the row disappears optimistically
    deleteMutation.mutate(employee.id, {
      onSuccess: () => toast.success(`${employee.fullName} was deleted.`),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "Delete failed"),
    });
  }

  return (
    <div className="space-y-4">
      <EmployeeFilters
        query={query}
        onChange={updateQuery}
        onClear={() => router.replace(pathname, { scroll: false })}
        isFetching={isFetching && !isPending}
      />

      <Card className="overflow-hidden">
        {isPending ? (
          <PageSpinner label="Loading employees..." />
        ) : isError ? (
          <div className="p-4">
            <ErrorAlert
              message={error.message}
              action={<Button variant="secondary" size="sm" onClick={() => refetch()}>Retry</Button>}
            />
          </div>
        ) : data.items.length === 0 ? (
          <EmptyState title="No employees found" message="Try a different search or clear the filters." />
        ) : (
          <>
            <EmployeeTable
              employees={data.items}
              sortBy={query.sortBy!}
              sortDir={query.sortDir!}
              onSort={handleSort}
              onDelete={setToDelete}
            />
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              totalCount={data.totalCount}
              pageSize={data.pageSize}
              onPageChange={(page) => updateQuery({ page })}
            />
          </>
        )}
      </Card>

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete employee?"
        message={<>This will permanently delete <b>{toDelete?.fullName}</b>.</>}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
