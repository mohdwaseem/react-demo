// Shared API shapes. These mirror the C# classes in backend/src/EmployeeDemo.Api/Dtos.
// TypeScript types disappear at runtime: they only help the editor and the compiler.

/** Mirrors PagedResult<T> in CommonDtos.cs */
export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

/**
 * RFC 7807 ProblemDetails, the error body returned by ASP.NET Core.
 * `errors` is present for validation (400) and some conflict (409) responses.
 */
export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  errors?: Record<string, string[]>;
}

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  totalDepartments: number;
  averageSalary: number;
  employeesByDepartment: { department: string; count: number }[];
}
