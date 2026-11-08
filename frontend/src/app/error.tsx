"use client"; // Error boundaries must be Client Components
// =====================================================================================
//  error.tsx catches errors thrown while rendering this route segment (and children),
//  like a try/catch around the page, or UseExceptionHandler("/Home/Error") in MVC.
// =====================================================================================
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { ErrorAlert } from "@/components/ui/Feedback";

// Don't name this component "Error": that would hide JavaScript's built-in Error class.
export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error); // send to your logging service here
  }, [error]);

  const message =
    error instanceof Error
      ? error.message
      : "Unexpected error. Is the .NET API running on http://localhost:5080?";

  return (
    <div className="mx-auto max-w-xl py-10">
      <ErrorAlert
        title="Could not load this page"
        message={message}
        action={<Button variant="secondary" onClick={() => retry()}>Try again</Button>}
      />
    </div>
  );
}
