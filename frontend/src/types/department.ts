// Mirrors DepartmentDtos.cs

export interface Department {
  id: number;
  name: string;
  code: string;
  description: string | null;
  employeeCount: number;
  createdAt: string;
}

/** Body of POST and PUT /api/departments */
export interface DepartmentSaveRequest {
  name: string;
  code: string;
  description?: string | null;
}
