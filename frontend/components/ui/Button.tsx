"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant =
  | "primary"
  | "outlined"
  | "ghost"
  | "secondary"
  | "danger"
  | "success"
  | "brand";
type Size = "sm" | "md" | "lg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  full?: boolean;
}

const variants: Record<Variant, string> = {
  primary: "border border-[var(--accent)] bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] hover:border-[var(--accent-hover)]",
  outlined:
    "border border-[var(--accent)] bg-transparent text-[var(--accent)] hover:bg-[var(--accent-soft)]",
  ghost: "border border-transparent bg-transparent text-[var(--accent)] hover:bg-[var(--accent-soft)]",
  secondary:
    "border border-[var(--border)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--surface-muted)]",
  danger:
    "border border-[var(--danger)] bg-[var(--danger)] text-white hover:opacity-90",
  success:
    "border border-[var(--success)] bg-[var(--success)] text-white hover:opacity-90",
  brand: "border border-[#1D9E75] bg-[#1D9E75] text-white hover:opacity-90",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", size = "md", className, children, loading, full, disabled, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[8px] font-medium transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/35 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
        full && "w-full",
        variants[variant],
        sizes[size],
        className
      )}
      {...rest}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  );
});
