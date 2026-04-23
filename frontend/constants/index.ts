import type { ExperienceLevel, ShortlistSize, SkillLevel } from "@/types";

export const API_URL: string =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const SHORTLIST_SIZES: ShortlistSize[] = [10, 20];

export const SKILL_LEVELS: SkillLevel[] = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Expert",
];

export const EXPERIENCE_LEVELS: ExperienceLevel[] = ["Junior", "Mid", "Senior", "Lead"];

export const AUTH_STORAGE_KEY = "umurava_auth";

export const DISCLAIMER =
  "Rankings are AI-generated suggestions. All final hiring decisions remain with the recruiter.";
