// One function per endpoint of DepartmentsController.cs.
// Used by Server Components / Server Actions (app/departments) AND by the client-side
// department dropdown in the employee form: the same code runs on both sides.
import { apiFetch } from "./client";
import type { Department, DepartmentSaveRequest } from "@/types/department";

export const departmentsApi = {
  list: (signal?: AbortSignal) => apiFetch<Department[]>("/api/departments", { signal }),

  get: (id: number) => apiFetch<Department>(`/api/departments/${id}`),

  create: (data: DepartmentSaveRequest, token: string | null) =>
    apiFetch<Department>("/api/departments", { method: "POST", body: data, token }),

  update: (id: number, data: DepartmentSaveRequest, token: string | null) =>
    apiFetch<Department>(`/api/departments/${id}`, { method: "PUT", body: data, token }),

  remove: (id: number, token: string | null) =>
    apiFetch<void>(`/api/departments/${id}`, { method: "DELETE", token }),
};
