"use client";
import { useState } from "react";
import { useDepartmentOptions } from "@/hooks/useDepartments";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import type { EmployeeQuery } from "@/types/employee";
import { Input, Select } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

type Changes = Partial<Record<keyof EmployeeQuery, string | number | boolean | undefined>>;

export function EmployeeFilters({ query, onChange, onClear, isFetching }: {
  query: EmployeeQuery;
  onChange: (changes: Changes) => void;
  onClear: () => void;
  isFetching: boolean;
}) {
  const { data: departments } = useDepartmentOptions();

  // The text box is a CONTROLLED input: React state is the single source of truth for its value.
  const [searchText, setSearchText] = useState(query.search ?? "");
  const pushSearch = useDebouncedCallback((text: string) => onChange({ search: text.trim() || undefined }), 400);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-60 flex-1">
        <Input
          type="search"
          placeholder="Search name or email..."
          aria-label="Search employees"
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            pushSearch(e.target.value);
          }}
        />
        {isFetching && <Spinner className="absolute top-2.5 right-3 size-4 text-slate-400" />}
      </div>

      <Select
        aria-label="Department"
        fullWidth={false}
        value={query.departmentId ?? ""}
        onChange={(e) => onChange({ departmentId: e.target.value || undefined })}
      >
        <option value="">All departments</option>
        {departments?.map((d) => (
          <option key={d.id} value={d.id}>{d.name}</option>
        ))}
      </Select>

      <Select
        aria-label="Status"
        fullWidth={false}
        value={query.isActive === undefined ? "" : String(query.isActive)}
        onChange={(e) => onChange({ isActive: e.target.value || undefined })}
      >
        <option value="">All statuses</option>
        <option value="true">Active</option>
        <option value="false">Inactive</option>
      </Select>

      <Select
        aria-label="Page size"
        fullWidth={false}
        value={query.pageSize}
        onChange={(e) => onChange({ pageSize: Number(e.target.value) })}
      >
        {[5, 10, 20, 50].map((size) => (
          <option key={size} value={size}>{size} / page</option>
        ))}
      </Select>

      <Button
        variant="ghost"
        onClick={() => {
          setSearchText("");
          onClear();
        }}
      >
        Clear
      </Button>
    </div>
  );
}
