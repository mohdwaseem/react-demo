"use client";
// Calls a Server Action from an onClick handler (not a form), wrapped in a transition so
// React gives us an `isPending` flag while the server works.
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteDepartment } from "@/app/departments/actions";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export function DeleteDepartmentButton({ id, name, employeeCount }: { id: number; name: string; employeeCount: number }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const result = await deleteDepartment(id);
      setOpen(false);
      if (result.ok) toast.success(`"${name}" deleted.`);
      else toast.error(result.message); // e.g. 409: still has employees
    });
  }

  return (
    <>
      <Button variant="ghost" size="sm" className="text-rose-600" onClick={() => setOpen(true)}>
        Delete
      </Button>
      <ConfirmDialog
        open={open}
        title={`Delete "${name}"?`}
        message={
          employeeCount > 0
            ? <>This department still has <b>{employeeCount}</b> employee(s). The API will refuse to delete it. Try it to see the 409 error handling!</>
            : "This cannot be undone."
        }
        isLoading={isPending}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
