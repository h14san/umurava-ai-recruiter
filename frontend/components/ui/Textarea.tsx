"use client";
import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, Props>(function Textarea(
  { label, error, className, id, rows = 5, ...rest },
  ref
) {
  const textareaId = id ?? rest.name;
  return (
    <label className="block" htmlFor={textareaId}>
      {label && (
        <span className="mb-1.5 block text-xs font-medium text-primary">{label}</span>
      )}
      <textarea
        id={textareaId}
        ref={ref}
        rows={rows}
        className={cn(
          "app-input min-h-[120px] resize-y px-3 py-2.5 text-sm",
          error && "border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[var(--danger)]/25",
          className
        )}
        {...rest}
      />
      {error && <span className="mt-1 block text-xs text-[var(--danger)]">{error}</span>}
    </label>
  );
});
