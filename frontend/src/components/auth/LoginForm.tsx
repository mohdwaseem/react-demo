"use client";
// =====================================================================================
//  The simplest form style: CONTROLLED inputs with useState.
//  value={username} + onChange={...} → React state always holds what is in the box.
//  (Compare with EmployeeForm = React Hook Form, DepartmentForm = Server Action.)
// =====================================================================================
import { useId, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api/client";
import { FormField, Input } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Card, ErrorAlert } from "@/components/ui/Feedback";

/** Only allow local paths ("/employees"), never "https://evil.com" or "//evil.com" (open redirect). */
function safeReturnUrl(value: string | null): string {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export function LoginForm() {
  const { login } = useAuth();
  const formId = useId();
  const router = useRouter();
  const returnUrl = safeReturnUrl(useSearchParams().get("returnUrl"));

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); // stop the browser's full-page form post
    setError(null);
    setIsSubmitting(true);
    try {
      await login(username, password);
      toast.success(`Welcome, ${username}!`);
      router.push(returnUrl);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <ErrorAlert title="Login failed" message={error} />}

        <FormField label="Username" htmlFor={"username-" + formId} required>
          <Input id={"username-" + formId} autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </FormField>

        <FormField label="Password" htmlFor={"password-" + formId} hint="Demo password: Admin@123" required>
          <Input
            id={"password-" + formId}
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </FormField>

        <Button type="submit" className="w-full" isLoading={isSubmitting} disabled={!username || !password}>
          Log in
        </Button>
      </form>
    </Card>
  );
}
