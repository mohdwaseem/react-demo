import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { PageSpinner } from "@/components/ui/Spinner";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm py-8">
      <h1 className="mb-1 text-2xl font-bold">Log in</h1>
      <p className="mb-6 text-sm text-slate-500">Reading data is public. Creating, editing and deleting need a login.</p>
      {/* LoginForm reads ?returnUrl= with useSearchParams → wrap in Suspense */}
      <Suspense fallback={<PageSpinner />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
