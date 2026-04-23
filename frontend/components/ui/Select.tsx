"use client";
import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, Props>(function Select(
  { label, error, className, id, children, ...rest },
  ref
) {
  const selectId = id ?? rest.name;
  return (
    <label className="block" htmlFor={selectId}>
      {label && (
        <span className="mb-1.5 block text-xs font-medium text-primary">{label}</span>
      )}
      <div className="relative">
        <select
          id={selectId}
          ref={ref}
          className={cn(
            "app-input appearance-none px-3 pr-9 text-sm",
            error && "border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[var(--danger)]/25",
            className
          )}
          {...rest}
        >
          {children}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
        />
      </div>
      {error && <span className="mt-1 block text-xs text-[var(--danger)]">{error}</span>}
    </label>
  );
});
