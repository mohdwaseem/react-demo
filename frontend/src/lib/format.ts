// Display helpers (like ToString("C") / ToString("d") in C#).

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function formatCurrency(value: number): string {
  return currency.format(value);
}

/** "2025-01-15" or an ISO date-time → "Jan 15, 2025" */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  // Date-only strings are parsed as UTC; add a time so they don't shift a day in some time zones.
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

const employmentTypeLabels: Record<string, string> = {
  FullTime: "Full time",
  PartTime: "Part time",
  Contract: "Contract",
  Intern: "Intern",
};

/** "FullTime" → "Full time" */
export function formatEmploymentType(value: string): string {
  return employmentTypeLabels[value] ?? value;
}
