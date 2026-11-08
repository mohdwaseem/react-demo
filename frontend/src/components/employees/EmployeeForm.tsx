"use client";
// =====================================================================================
//  ONE form component for both Create and Edit (like a shared _EmployeeForm partial view).
//  React Hook Form keeps field values; Zod validates them in the browser;
//  the .NET API validates again and its errors are mapped back onto the fields.
//  GUIDE: docs/guide/10-forms-and-validation.md
// =====================================================================================
import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";
import { employeeSchema, emptyEmployeeForm, type EmployeeFormValues } from "@/lib/validation/employee";
import { useCreateEmployee, useUpdateEmployee } from "@/hooks/useEmployees";
import { useDepartmentOptions } from "@/hooks/useDepartments";
import { EMPLOYMENT_TYPES, type Employee } from "@/types/employee";
import { formatEmploymentType } from "@/lib/format";
import { FormField, Input, Select } from "@/components/ui/FormField";
import { Button, LinkButton } from "@/components/ui/Button";
import { Card, ErrorAlert } from "@/components/ui/Feedback";

interface EmployeeFormProps {
  /** Pass an employee to edit it; leave empty to create a new one. */
  employee?: Employee;
  /** Called when the API says the record changed in the meantime (HTTP 409). */
  onReloadRequested?: () => void;
}

function toFormValues(e: Employee): EmployeeFormValues {
  return {
    firstName: e.firstName,
    lastName: e.lastName,
    email: e.email,
    phone: e.phone ?? "",
    hireDate: e.hireDate,
    salary: e.salary,
    isActive: e.isActive,
    employmentType: e.employmentType,
    departmentId: e.departmentId,
  };
}

export function EmployeeForm({ employee, onReloadRequested }: EmployeeFormProps) {
  const isEdit = employee !== undefined;
  const router = useRouter();
  const { data: departments, isPending: departmentsLoading } = useDepartmentOptions();
  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee(employee?.id ?? 0);
  const [concurrencyError, setConcurrencyError] = useState<string | null>(null);

  // useId() gives a unique prefix per form instance. Next.js keeps recently visited pages
  // mounted (hidden), so two forms can exist at once: hard-coded ids like "salary" would clash.
  const formId = useId();
  const id = (field: keyof EmployeeFormValues) => `${formId}-${field}`;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: employee ? toFormValues(employee) : emptyEmployeeForm,
  });

  // Runs only when Zod validation passed.
  async function onSubmit(values: EmployeeFormValues) {
    setConcurrencyError(null);
    const payload = { ...values, phone: values.phone || null };
    try {
      const saved = isEdit
        ? await updateMutation.mutateAsync({ ...payload, rowVersion: employee.rowVersion })
        : await createMutation.mutateAsync(payload);
      toast.success(isEdit ? "Employee updated." : `${saved.fullName} was added.`);
      router.push(`/employees/${saved.id}`);
    } catch (err) {
      if (!(err instanceof ApiError)) throw err;
      const fieldNames = Object.keys(err.fieldErrors);
      if (fieldNames.length > 0) {
        // Server-side validation (400) or duplicate email (409) → show under the inputs.
        for (const field of fieldNames) {
          if (field in employeeSchema.shape) {
            setError(field as keyof EmployeeFormValues, { type: "server", message: err.fieldErrors[field] });
          }
        }
        toast.error("Please fix the highlighted fields.");
      } else if (err.status === 409) {
        setConcurrencyError(err.message); // someone else saved this employee first
      } else if (err.status !== 401) {
        toast.error(err.message); // 401 is handled globally in providers.tsx
      }
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        {concurrencyError && (
          <ErrorAlert
            title="This employee was changed by someone else"
            message={concurrencyError}
            action={onReloadRequested && (
              <Button variant="secondary" size="sm" type="button" onClick={onReloadRequested}>
                Reload latest version
              </Button>
            )}
          />
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="First name" htmlFor={id("firstName")} error={errors.firstName?.message} required>
            <Input id={id("firstName")} autoComplete="given-name" hasError={!!errors.firstName} {...register("firstName")} />
          </FormField>

          <FormField label="Last name" htmlFor={id("lastName")} error={errors.lastName?.message} required>
            <Input id={id("lastName")} autoComplete="family-name" hasError={!!errors.lastName} {...register("lastName")} />
          </FormField>

          <FormField label="Email" htmlFor={id("email")} error={errors.email?.message} required>
            <Input id={id("email")} type="email" autoComplete="email" hasError={!!errors.email} {...register("email")} />
          </FormField>

          <FormField label="Phone" htmlFor={id("phone")} error={errors.phone?.message} hint="Optional">
            <Input id={id("phone")} type="tel" autoComplete="tel" hasError={!!errors.phone} {...register("phone")} />
          </FormField>

          <FormField label="Department" htmlFor={id("departmentId")} error={errors.departmentId?.message} required>
            <Select
              id={id("departmentId")}
              hasError={!!errors.departmentId}
              disabled={departmentsLoading}
              {...register("departmentId", { valueAsNumber: true })}
            >
              <option value={0}>{departmentsLoading ? "Loading..." : "Select a department"}</option>
              {departments?.map((d) => (
                <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
              ))}
            </Select>
          </FormField>

          <FormField label="Employment type" htmlFor={id("employmentType")} error={errors.employmentType?.message} required>
            <Select id={id("employmentType")} hasError={!!errors.employmentType} {...register("employmentType")}>
              {EMPLOYMENT_TYPES.map((t) => (
                <option key={t} value={t}>{formatEmploymentType(t)}</option>
              ))}
            </Select>
          </FormField>

          <FormField label="Hire date" htmlFor={id("hireDate")} error={errors.hireDate?.message} required>
            <Input id={id("hireDate")} type="date" hasError={!!errors.hireDate} {...register("hireDate")} />
          </FormField>

          <FormField label="Salary (USD)" htmlFor={id("salary")} error={errors.salary?.message} required>
            <Input
              id={id("salary")}
              type="number"
              step="1000"
              min={0}
              hasError={!!errors.salary}
              {...register("salary", { valueAsNumber: true })}
            />
          </FormField>
        </div>

        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input type="checkbox" className="size-4 rounded border-slate-300 accent-indigo-600" {...register("isActive")} />
          Active employee
        </label>

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-5">
          <LinkButton href={isEdit ? `/employees/${employee.id}` : "/employees"} variant="secondary">
            Cancel
          </LinkButton>
          <Button type="submit" isLoading={isSubmitting} disabled={isEdit && !isDirty}>
            {isEdit ? "Save changes" : "Create employee"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
