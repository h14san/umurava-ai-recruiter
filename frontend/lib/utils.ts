import clsx, { type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export type ScoreTier = "strong" | "partial" | "weak";

export function scoreTier(score: number): ScoreTier {
  if (score >= 80) return "strong";
  if (score >= 60) return "partial";
  return "weak";
}

export function scoreHex(score: number): string {
  const t = scoreTier(score);
  if (t === "strong") return "#10B981";
  if (t === "partial") return "#F59E0B";
  return "#EF4444";
}

export function scoreColor(score: number): string {
  const t = scoreTier(score);
  if (t === "strong") return "bg-[#10B981]";
  if (t === "partial") return "bg-[#F59E0B]";
  return "bg-[#EF4444]";
}

export function scoreLabel(score: number): string {
  const t = scoreTier(score);
  if (t === "strong") return "Strong match";
  if (t === "partial") return "Partial match";
  return "Weak match";
}

export function fullName(first: string, last: string) {
  return `${first} ${last}`.trim();
}

export function initials(first: string, last: string) {
  return `${(first || "?").charAt(0)}${(last || "?").charAt(0)}`.toUpperCase();
}
