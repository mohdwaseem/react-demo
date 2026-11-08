"use client";
// A modal "Are you sure?" dialog. It is "controlled": the parent decides when it is open
// (the `open` prop) and gets told what happened (onConfirm / onCancel callbacks).
import { useEffect } from "react";
import { Button } from "./Button";

export function ConfirmDialog({ open, title, message, confirmText = "Delete", isLoading = false, onConfirm, onCancel }: {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  // Close with the Escape key. useEffect = "run this side effect after rendering".
  // The returned function is the cleanup (like Dispose), run when `open` changes or on unmount.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null; // render nothing when closed

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={onCancel}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()} // clicks inside the box must not close it
      >
        <h2 id="confirm-title" className="text-lg font-semibold text-slate-900">{title}</h2>
        <div className="mt-2 text-sm text-slate-600">{message}</div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={isLoading}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm} isLoading={isLoading} autoFocus>{confirmText}</Button>
        </div>
      </div>
    </div>
  );
}
