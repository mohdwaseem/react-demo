"use client";
import { useQuery } from "@tanstack/react-query";
import { departmentsApi } from "@/lib/api/departments";

/** Departments for dropdowns (employee form + list filter). Cached for 5 minutes. */
export function useDepartmentOptions() {
  return useQuery({
    queryKey: ["departments"],
    queryFn: ({ signal }) => departmentsApi.list(signal),
    staleTime: 5 * 60_000,
  });
}
