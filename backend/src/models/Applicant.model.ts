import { Schema, model, Document, Types } from "mongoose";
import {
  SKILL_LEVELS,
  LANGUAGE_PROFICIENCIES,
  AVAILABILITY_STATUSES,
  AVAILABILITY_TYPES,
} from "../constants";
import type { UmuravaProfile } from "../types";

export interface ApplicantDocument extends Document, UmuravaProfile {
  _id: Types.ObjectId;
  job: Types.ObjectId;
  addedBy: Types.ObjectId;
  externalId: string;
  createdAt: Date;
  updatedAt: Date;
}

const SkillSchema = new Schema(
  {
    name: { type: String, required: true },
    level: { type: String, enum: SKILL_LEVELS, required: true },
    yearsOfExperience: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const LanguageSchema = new Schema(
  {
    name: { type: String, required: true },
    proficiency: { type: String, enum: LANGUAGE_PROFICIENCIES, required: true },
  },
  { _id: false }
);

const ExperienceSchema = new Schema(
  {
    company: { type: String, required: true },
    role: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    isCurrent: { type: Boolean, default: false },
    description: { type: String, default: "" },
    technologies: { type: [String], default: [] },
  },
  { _id: false }
);

const EducationSchema = new Schema(
  {
    institution: { type: String, required: true },
    degree: { type: String, required: true },
    fieldOfStudy: { type: String, required: true },
    startYear: { type: Number, required: true },
    endYear: { type: Number, required: true },
  },
  { _id: false }
);

const CertificationSchema = new Schema(
  {
    name: { type: String, required: true },
    issuer: { type: String, required: true },
    issueDate: { type: String, required: true },
  },
  { _id: false }
);

const ProjectSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    technologies: { type: [String], default: [] },
    role: { type: String, default: "" },
    link: { type: String, default: "" },
    startDate: { type: String, default: "" },
    endDate: { type: String, default: "" },
  },
  { _id: false }
);

const AvailabilitySchema = new Schema(
  {
    status: { type: String, enum: AVAILABILITY_STATUSES, required: true },
    type: { type: String, enum: AVAILABILITY_TYPES, required: true },
    startDate: { type: String, required: true },
  },
  { _id: false }
);

const SocialLinksSchema = new Schema(
  {
    linkedin: { type: String, default: "" },
    github: { type: String, default: "" },
    portfolio: { type: String, default: "" },
  },
  { _id: false }
);

const ApplicantSchema = new Schema<ApplicantDocument>(
  {
    job: { type: Schema.Types.ObjectId, ref: "Job", required: true, index: true },
    addedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    externalId: { type: String, required: true, index: true },

    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    headline: { type: String, required: true },
    bio: { type: String, default: "" },
    location: { type: String, required: true },
    skills: { type: [SkillSchema], default: [] },
    languages: { type: [LanguageSchema], default: [] },
    experience: { type: [ExperienceSchema], default: [] },
    education: { type: [EducationSchema], default: [] },
    certifications: { type: [CertificationSchema], default: [] },
    projects: { type: [ProjectSchema], default: [] },
    availability: { type: AvailabilitySchema, required: true },
    socialLinks: { type: SocialLinksSchema, default: () => ({}) },
  },
  { timestamps: true }
);

ApplicantSchema.index({ job: 1, externalId: 1 }, { unique: true });

export const ApplicantModel = model<ApplicantDocument>("Applicant", ApplicantSchema);
