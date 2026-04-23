export type SkillLevel = "Beginner" | "Intermediate" | "Advanced" | "Expert";
export type LanguageProficiency = "Basic" | "Conversational" | "Fluent" | "Native";
export type ExperienceLevel = "Junior" | "Mid" | "Senior" | "Lead";
export type ShortlistSize = 10 | 20;
export type AvailabilityStatus = "Available" | "Open to Opportunities" | "Not Available";
export type AvailabilityType = "Full-time" | "Part-time" | "Contract";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "recruiter";
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
  status: AvailabilityStatus;
  type: AvailabilityType;
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

export interface Applicant extends UmuravaProfile {
  _id: string;
  job: string;
  externalId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  _id: string;
  recruiter: string;
  title: string;
  description: string;
  requiredSkills: string[];
  experienceLevel: ExperienceLevel;
  location: string;
  status: "open" | "closed";
  createdAt: string;
  updatedAt: string;
}

export interface ScreeningCandidateResult {
  candidateId:
    | string
    | {
        _id: string;
        firstName: string;
        lastName: string;
        headline: string;
        location: string;
        email: string;
        skills: UmuravaSkill[];
        socialLinks?: UmuravaSocialLinks;
        externalId?: string;
      };
  externalId: string;
  rank: number;
  matchScore: number;
  strengths: string[];
  gaps: string[];
  recommendation: string;
  skillMatchBreakdown: { matched: string[]; missing: string[] };
}

export interface ScreeningResult {
  _id: string;
  job: string;
  shortlistSize: ShortlistSize;
  model: string;
  promptVersion: string;
  results: ScreeningCandidateResult[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobInput {
  title: string;
  description: string;
  requiredSkills: string[];
  experienceLevel: ExperienceLevel;
  location: string;
}
