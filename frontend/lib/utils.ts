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

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes('"') || str.includes(",") || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export interface CsvRow {
  rank: number;
  name: string;
  email: string;
  matchScore: number;
  skills: number;
  experience: number;
  education: number;
  projects: number;
  matched: string;
  missing: string;
  strengths: string;
  gaps: string;
  recommendation: string;
}

export function rowsToCsv(rows: CsvRow[]): string {
  const headers: Array<keyof CsvRow> = [
    "rank",
    "name",
    "email",
    "matchScore",
    "skills",
    "experience",
    "education",
    "projects",
    "matched",
    "missing",
    "strengths",
    "gaps",
    "recommendation",
  ];
  const headerLine = headers.join(",");
  const lines = rows.map((row) => headers.map((key) => csvCell(row[key])).join(","));
  return [headerLine, ...lines].join("\n");
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "shortlist";
}
