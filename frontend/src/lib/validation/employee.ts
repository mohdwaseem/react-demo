// =====================================================================================
//  Client-side validation rules with Zod. They mirror the DataAnnotations in EmployeeDtos.cs.
//  The server ALWAYS validates again: client validation is only for fast feedback.
//  GUIDE: docs/guide/10-forms-and-validation.md
// =====================================================================================
import { z } from "zod";
import { EMPLOYMENT_TYPES } from "@/types/employee";

export const employeeSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(50, "Max 50 characters"),
  lastName: z.string().trim().min(1, "Last name is required").max(50, "Max 50 characters"),
  email: z.email("Enter a valid email address").max(150),
  phone: z
    .string()
    .trim()
    .max(20, "Max 20 characters")
    .regex(/^[0-9+\-() ]*$/, "Only digits, spaces and + - ( )"),
  hireDate: z.iso.date("Pick a hire date"),
  // register(..., { valueAsNumber: true }) gives NaN for an empty box → z.number() reports it.
  salary: z.number("Salary is required").min(0, "Salary cannot be negative").max(10_000_000, "Too large"),
  isActive: z.boolean(),
  employmentType: z.enum(EMPLOYMENT_TYPES),
  departmentId: z.number().int().min(1, "Please select a department"),
});

/** The TypeScript type is generated from the schema: one source of truth. */
export type EmployeeFormValues = z.infer<typeof employeeSchema>;

export const emptyEmployeeForm: EmployeeFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  hireDate: new Date().toISOString().slice(0, 10),
  salary: 50000,
  isActive: true,
  employmentType: "FullTime",
  departmentId: 0,
};
