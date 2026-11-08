"use server";
// =====================================================================================
//  SERVER ACTIONS: async functions that run on the Next.js server but can be called
//  from a <form action={...}> or a button in the browser. Next.js turns the call into a POST.
//  Here they act as a thin layer: validate FormData → call the .NET API with the JWT
//  from the cookie → refresh the page data.
//  ⚠ Anyone can POST to a Server Action, so always check auth inside it.
//  GUIDE: docs/guide/07-routing-and-rendering.md#server-actions
// =====================================================================================
import { revalidatePath } from "next/cache";
import { departmentsApi } from "@/lib/api/departments";
import { ApiError } from "@/lib/api/client";
import { getServerToken } from "@/lib/auth/server";
import { departmentSchema, type DepartmentFormValues } from "@/lib/validation/department";

/** What the form gets back after submitting (consumed by useActionState). */
export interface DepartmentFormState {
  success?: boolean;
  message?: string;
  errors?: Partial<Record<keyof DepartmentFormValues, string>>;
  /** Echo the submitted values so the form can show them again after an error. */
  values?: DepartmentFormValues;
}

function readForm(formData: FormData): DepartmentFormValues {
  return {
    name: String(formData.get("name") ?? ""),
    code: String(formData.get("code") ?? ""),
    description: String(formData.get("description") ?? ""),
  };
}

async function save(id: number | null, formData: FormData): Promise<DepartmentFormState> {
  const values = readForm(formData);

  // 1) Validate on the Next.js server (Zod). Fast feedback without calling the API.
  const parsed = departmentSchema.safeParse(values);
  if (!parsed.success) {
    const errors: DepartmentFormState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as keyof DepartmentFormValues;
      errors[field] ??= issue.message;
    }
    return { errors, values, message: "Please fix the highlighted fields." };
  }

  // 2) Auth: read the JWT from the cookie.
  const token = await getServerToken();
  if (!token) return { values, message: "Your session has expired. Please log in again." };

  // 3) Call the .NET API (server → server, so no CORS involved).
  try {
    const saved = id === null
      ? await departmentsApi.create(parsed.data, token)
      : await departmentsApi.update(id, parsed.data, token);

    // 4) Tell Next.js the departments pages show outdated data → re-render them.
    revalidatePath("/departments");
    return { success: true, message: `Department "${saved.name}" saved.` };
  } catch (err) {
    if (err instanceof ApiError) {
      return { values, errors: err.fieldErrors, message: err.message };
    }
    throw err; // unexpected → error.tsx
  }
}

export async function createDepartment(_prev: DepartmentFormState, formData: FormData) {
  return save(null, formData);
}

/** Bound with the id on the page: updateDepartment.bind(null, id) */
export async function updateDepartment(id: number, _prev: DepartmentFormState, formData: FormData) {
  return save(id, formData);
}

export async function deleteDepartment(id: number): Promise<{ ok: boolean; message: string }> {
  const token = await getServerToken();
  if (!token) return { ok: false, message: "Please log in first." };
  try {
    await departmentsApi.remove(id, token);
    revalidatePath("/departments");
    revalidatePath("/"); // dashboard counts changed too
    return { ok: true, message: "Department deleted." };
  } catch (err) {
    // e.g. 409 "Engineering still has 9 employee(s)..."
    if (err instanceof ApiError) return { ok: false, message: err.message };
    throw err;
  }
}
