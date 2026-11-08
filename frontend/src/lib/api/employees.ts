// One function per endpoint of EmployeesController.cs, like a typed "repository" for the API.
import { apiFetch } from "./client";
import type { PagedResult } from "@/types/api";
import type { Employee, EmployeeCreateRequest, EmployeeQuery, EmployeeUpdateRequest } from "@/types/employee";

export const employeesApi = {
  list: (query: EmployeeQuery, signal?: AbortSignal) =>
    apiFetch<PagedResult<Employee>>("/api/employees", { query: { ...query }, signal }),

  get: (id: number, signal?: AbortSignal) => apiFetch<Employee>(`/api/employees/${id}`, { signal }),

  create: (data: EmployeeCreateRequest, token: string | null) =>
    apiFetch<Employee>("/api/employees", { method: "POST", body: data, token }),

  update: (id: number, data: EmployeeUpdateRequest, token: string | null) =>
    apiFetch<Employee>(`/api/employees/${id}`, { method: "PUT", body: data, token }),

  remove: (id: number, token: string | null) =>
    apiFetch<void>(`/api/employees/${id}`, { method: "DELETE", token }),
};
