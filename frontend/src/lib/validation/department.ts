// Mirrors DepartmentSaveDto in DepartmentDtos.cs. Used on the SERVER inside the Server Actions
// (app/departments/actions.ts) to validate FormData before calling the API.
import { z } from "zod";

export const departmentSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  code: z
    .string()
    .trim()
    .min(2, "Code must be at least 2 characters")
    .max(10, "Max 10 characters")
    .regex(/^[A-Za-z0-9]+$/, "Letters and digits only"),
  description: z.string().trim().max(500, "Max 500 characters").optional(),
});

export type DepartmentFormValues = z.infer<typeof departmentSchema>;
