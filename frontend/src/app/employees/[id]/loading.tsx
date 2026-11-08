// loading.tsx = automatic <Suspense> fallback for this route segment (and its children,
// e.g. /employees/5/edit). Shown instantly on navigation while the page renders.
import { PageSpinner } from "@/components/ui/Spinner";

export default function Loading() {
  return <PageSpinner label="Loading employee..." />;
}
