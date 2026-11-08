// Shown for unknown URLs, or when a page calls notFound() (e.g. GET /api/employees/999 → 404).
import { LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Feedback";

export default function NotFound() {
  return (
    <EmptyState
      title="Page not found"
      message="The page or record you are looking for does not exist."
      action={<LinkButton href="/">Back to dashboard</LinkButton>}
    />
  );
}
