export const SCORING_WEIGHTS = {
  skills: 40,
  experience: 25,
  education: 15,
  projects: 20,
} as const;

export const SHORTLIST_SIZES = [10, 20] as const;
export type ShortlistSize = (typeof SHORTLIST_SIZES)[number];

export const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"] as const;
export type SkillLevel = (typeof SKILL_LEVELS)[number];

export const LANGUAGE_PROFICIENCIES = ["Basic", "Conversational", "Fluent", "Native"] as const;
export type LanguageProficiency = (typeof LANGUAGE_PROFICIENCIES)[number];

export const EXPERIENCE_LEVELS = ["Junior", "Mid", "Senior", "Lead"] as const;
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

export const AVAILABILITY_STATUSES = [
  "Available",
  "Open to Opportunities",
  "Not Available",
] as const;

export const AVAILABILITY_TYPES = ["Full-time", "Part-time", "Contract"] as const;

export const GEMINI_MODEL = "gemini-2.5-flash" as const;
export const PROMPT_VERSION = "v1" as const;

export const JWT_EXPIRES_IN = "7d" as const;
export const BCRYPT_ROUNDS = 10;
