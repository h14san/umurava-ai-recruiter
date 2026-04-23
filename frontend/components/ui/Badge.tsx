import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type Tone =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "indigo"
  | "accent"
  | "skill";

interface Props extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

const tones: Record<Tone, string> = {
  neutral: "bg-[var(--surface-muted)] text-[var(--text-secondary)]",
  success: "bg-[var(--success-soft)] text-[var(--success)]",
  warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
  danger: "bg-[var(--danger-soft)] text-[var(--danger)]",
  info: "bg-[var(--accent-soft)] text-[var(--accent)]",
  indigo: "bg-[var(--accent-soft)] text-[var(--accent)]",
  accent: "bg-[var(--accent-soft)] text-[var(--accent)]",
  skill: "bg-[var(--accent-soft)] text-[var(--accent)]",
};

export function Badge({ tone = "neutral", className, ...rest }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[6px] px-2.5 py-1 text-xs font-medium",
        tones[tone],
        className
      )}
      {...rest}
    />
  );
}
