"use client";
// =====================================================================================
//  TanStack Query hooks for employees.
//  useQuery    = READ  (GET)  → caching, loading/error state, refetching for free
//  useMutation = WRITE (POST/PUT/DELETE) → pending state, then invalidate the cache
//  GUIDE: docs/guide/09-integrating-backend-apis.md#tanstack-query
// =====================================================================================
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { employeesApi } from "@/lib/api/employees";
import { useAuth } from "@/context/AuthContext";
import type { PagedResult } from "@/types/api";
import type { Employee, EmployeeCreateRequest, EmployeeQuery, EmployeeUpdateRequest } from "@/types/employee";

/**
 * Query keys identify cached data, like cache keys in IMemoryCache.
 * Invalidating ["employees"] refreshes every list AND every detail at once.
 */
export const employeeKeys = {
  all: ["employees"] as const,
  lists: () => [...employeeKeys.all, "list"] as const,
  list: (query: EmployeeQuery) => [...employeeKeys.lists(), query] as const,
  detail: (id: number) => [...employeeKeys.all, "detail", id] as const,
};

/** Paged/filtered list. Changing `query` automatically fetches the new page. */
export function useEmployeeList(query: EmployeeQuery) {
  return useQuery({
    queryKey: employeeKeys.list(query),
    queryFn: ({ signal }) => employeesApi.list(query, signal), // signal cancels outdated requests
    placeholderData: keepPreviousData, // keep showing the old page while the next one loads
  });
}

export function useEmployee(id: number) {
  return useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: ({ signal }) => employeesApi.get(id, signal),
    enabled: Number.isFinite(id) && id > 0,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: EmployeeCreateRequest) => employeesApi.create(data, token),
    onSuccess: () => {
      // Lists are now outdated → mark them stale so they refetch when shown.
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
  });
}

export function useUpdateEmployee(id: number) {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: EmployeeUpdateRequest) => employeesApi.update(id, data, token),
    onSuccess: (updated) => {
      queryClient.setQueryData(employeeKeys.detail(id), updated); // put fresh data straight into the cache
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
  });
}

/**
 * Delete with an OPTIMISTIC update: the row disappears immediately, and comes back
 * if the API call fails (e.g. 401, or the record was already deleted).
 */
export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: number) => employeesApi.remove(id, token),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: employeeKeys.lists() });
      // Snapshot every cached list so we can roll back.
      const previous = queryClient.getQueriesData<PagedResult<Employee>>({ queryKey: employeeKeys.lists() });
      queryClient.setQueriesData<PagedResult<Employee>>({ queryKey: employeeKeys.lists() }, (old) =>
        old ? { ...old, items: old.items.filter((e) => e.id !== id), totalCount: old.totalCount - 1 } : old,
      );
      return { previous }; // becomes `context` in onError
    },

    onError: (_error, _id, context) => {
      context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data)); // roll back
    },

    onSettled: () => {
      // Success or failure: re-sync with the server.
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
    },
  });
}
