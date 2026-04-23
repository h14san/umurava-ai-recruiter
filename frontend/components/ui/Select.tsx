"use client";
import { forwardRef, type SelectHTMLAttributes } from "react";
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
        <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      )}
      <select
        id={selectId}
        ref={ref}
        className={cn(
          "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20",
          error && "border-red-400 focus:border-red-500",
          className
        )}
        {...rest}
      >
        {children}
      </select>
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
});
