"use client";
// =====================================================================================
//  A form posted to a SERVER ACTION, with React 19's useActionState hook.
//  No React Hook Form, no fetch: <form action={formAction}> sends FormData to the server
//  function and `state` holds whatever the action returned (errors, message, success).
//  This is the closest thing to a classic MVC form post + ModelState in React.
// =====================================================================================
import { useActionState, useId } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { DepartmentFormState } from "@/app/departments/actions";
import type { DepartmentFormValues } from "@/lib/validation/department";
import { FormField, Input, Textarea } from "@/components/ui/FormField";
import { Button, LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Feedback";

type Action = (prev: DepartmentFormState, formData: FormData) => Promise<DepartmentFormState>;

export function DepartmentForm({ action, submitLabel, initialValues }: {
  action: Action;
  submitLabel: string;
  initialValues?: DepartmentFormValues;
}) {
  const router = useRouter();
  const formId = useId(); // unique ids even if two forms are mounted (see EmployeeForm)

  // [latest result, function to put in <form action>, true while the action runs]
  // We wrap the Server Action to react to its result right after it finishes
  // (toast + navigate) instead of watching `state` in a useEffect.
  const [state, formAction, isPending] = useActionState(
    async (prev: DepartmentFormState, formData: FormData) => {
      const result = await action(prev, formData); // ← runs on the server
      if (result.success) {
        toast.success(result.message);
        router.push("/departments");
      } else if (result.message) {
        toast.error(result.message);
      }
      return result;
    },
    {},
  );

  // After a failed submit show what the user typed, otherwise the initial values.
  const values = state.values ?? initialValues;

  return (
    <Card className="max-w-2xl p-6">
      {/* key: remount the inputs with the echoed values after each submit */}
      <form action={formAction} className="space-y-5" key={JSON.stringify(values ?? {})}>
        <div className="grid gap-5 sm:grid-cols-[1fr_10rem]">
          <FormField label="Name" htmlFor={"name-" + formId} error={state.errors?.name} required>
            <Input id={"name-" + formId} name="name" defaultValue={values?.name} hasError={!!state.errors?.name} />
          </FormField>
          <FormField label="Code" htmlFor={"code-" + formId} error={state.errors?.code} hint="e.g. ENG" required>
            <Input id={"code-" + formId} name="code" defaultValue={values?.code} hasError={!!state.errors?.code} className="uppercase" />
          </FormField>
        </div>

        <FormField label="Description" htmlFor={"description-" + formId} error={state.errors?.description} hint="Optional">
          <Textarea id={"description-" + formId} name="description" rows={3} defaultValue={values?.description} hasError={!!state.errors?.description} />
        </FormField>

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-5">
          <LinkButton href="/departments" variant="secondary">Cancel</LinkButton>
          <Button type="submit" isLoading={isPending}>{submitLabel}</Button>
        </div>
      </form>
    </Card>
  );
}
