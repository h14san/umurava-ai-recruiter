import type { Request } from "express";
import type {
  SkillLevel,
  LanguageProficiency,
  ExperienceLevel,
  ShortlistSize,
} from "../constants";

export type { ShortlistSize } from "../constants";

export interface AuthTokenPayload {
  userId: string;
  email: string;
}

export interface AuthedRequest extends Request {
  user?: AuthTokenPayload;
}

export interface UmuravaSkill {
  name: string;
  level: SkillLevel;
  yearsOfExperience: number;
}

export interface UmuravaLanguage {
  name: string;
  proficiency: LanguageProficiency;
}

export interface UmuravaExperience {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
  technologies: string[];
}

export interface UmuravaEducation {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number;
  endYear: number;
}

export interface UmuravaCertification {
  name: string;
  issuer: string;
  issueDate: string;
}

export interface UmuravaProject {
  name: string;
  description: string;
  technologies: string[];
  role: string;
  link: string;
  startDate: string;
  endDate: string;
}

export interface UmuravaAvailability {
  status: "Available" | "Open to Opportunities" | "Not Available";
  type: "Full-time" | "Part-time" | "Contract";
  startDate: string;
}

export interface UmuravaSocialLinks {
  linkedin: string;
  github: string;
  portfolio: string;
}

export interface UmuravaProfile {
  firstName: string;
  lastName: string;
  email: string;
  headline: string;
  bio?: string;
  location: string;
  skills: UmuravaSkill[];
  languages: UmuravaLanguage[];
  experience: UmuravaExperience[];
  education: UmuravaEducation[];
  certifications: UmuravaCertification[];
  projects: UmuravaProject[];
  availability: UmuravaAvailability;
  socialLinks: UmuravaSocialLinks;
}

export interface JobInput {
  title: string;
  description: string;
  requiredSkills: string[];
  experienceLevel: ExperienceLevel;
  location: string;
}

export interface AISubScores {
  skills: number;
  experience: number;
  education: number;
  projects: number;
}

export interface AIScreeningResult {
  candidateId: string;
  rank: number;
  matchScore: number;
  subScores: AISubScores;
  strengths: string[];
  gaps: string[];
  recommendation: string;
  skillMatchBreakdown: {
    matched: string[];
    missing: string[];
  };
}

export interface RunScreeningInput {
  jobId: string;
  shortlistSize: ShortlistSize;
}
