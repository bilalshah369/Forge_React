"use client";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useState } from "react";

export type StatusOption = {
  label: string;
  value: string;
  color: string; // e.g. "bg-red-500"
};

type StatusMultiSelectProps = {
  statuses: StatusOption[];
  selected: string; // comma-separated string
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function StatusMultiSelect({
  statuses,
  selected,
  onChange,
  placeholder = "Filter by Status",
  className,
}: StatusMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedArray = selected
    .split(",")
    .map((s) => s.trim())
    .filter((s) => !!s);

  const toggle = (value: string) => {
    const next = selectedArray.includes(value)
      ? selectedArray.filter((v) => v !== value)
      : [...selectedArray, value];

    onChange(next.join(","));
  };

  const filtered = statuses.filter((s) =>
    s.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "w-64 h-10 px-3 py-2 border border-input bg-white rounded-md text-left text-sm flex items-center justify-between",
          selectedArray.length === 0
            ? "text-muted-foreground"
            : "text-foreground",
          className
        )}
      >
        {selectedArray.length === 0
          ? placeholder
          : `${selectedArray.length} selected`}
        <svg
          className="w-4 h-4 ml-2 text-muted-foreground"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M10 12l-6-6h12l-6 6z" />
        </svg>
      </PopoverTrigger>

      <PopoverContent className="w-64 p-2">
        <Input
          placeholder="Search"
          className="mb-2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <ScrollArea className="max-h-60">
          {filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground px-2 py-1">
              No results
            </div>
          ) : (
            filtered.map((status) => (
              <div
                key={status.value}
                className="flex items-center space-x-2 py-1 px-1"
              >
                <Checkbox
                  id={status.value}
                  checked={selectedArray.includes(status.value)}
                  onCheckedChange={() => toggle(status.value)}
                />
                <span
                  className={`w-3 h-3 rounded-full ${status.color} inline-block`}
                />
                <label htmlFor={status.value} className="text-sm">
                  {status.label}
                </label>
              </div>
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
