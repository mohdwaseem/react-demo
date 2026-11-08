// Mirrors EmployeeDtos.cs. A C# enum becomes a union of string literals in TypeScript.

export const EMPLOYMENT_TYPES = ["FullTime", "PartTime", "Contract", "Intern"] as const;
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number]; // "FullTime" | "PartTime" | ...

/** Returned by GET /api/employees and GET /api/employees/{id} */
export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string | null;
  hireDate: string; // DateOnly is serialized as "2025-01-15"
  salary: number;
  isActive: boolean;
  employmentType: EmploymentType;
  departmentId: number;
  departmentName: string;
  rowVersion: string;
  createdAt: string;
  updatedAt: string | null;
}

/** Body of POST /api/employees */
export interface EmployeeCreateRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  hireDate: string;
  salary: number;
  isActive: boolean;
  employmentType: EmploymentType;
  departmentId: number;
}

/** Body of PUT /api/employees/{id}: the create fields plus the concurrency token */
export interface EmployeeUpdateRequest extends EmployeeCreateRequest {
  rowVersion: string;
}

export type SortField = "name" | "email" | "hireDate" | "salary" | "department";
export type SortDir = "asc" | "desc";

/** Query-string of GET /api/employees (mirrors EmployeeQuery.cs) */
export interface EmployeeQuery {
  search?: string;
  departmentId?: number;
  isActive?: boolean;
  sortBy?: SortField;
  sortDir?: SortDir;
  page?: number;
  pageSize?: number;
}
