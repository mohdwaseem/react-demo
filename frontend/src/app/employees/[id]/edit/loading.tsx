// Each segment that reads `params` gets its own loading.tsx, so navigation can show
// this placeholder instantly while the page (which awaits params) renders.
import { PageSpinner } from "@/components/ui/Spinner";

export default function Loading() {
  return <PageSpinner label="Loading employee..." />;
}
