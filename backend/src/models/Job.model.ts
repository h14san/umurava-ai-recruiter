import { Schema, model, Document, Types } from "mongoose";
import { EXPERIENCE_LEVELS, type ExperienceLevel } from "../constants";

export interface JobDocument extends Document {
  _id: Types.ObjectId;
  recruiter: Types.ObjectId;
  title: string;
  description: string;
  requiredSkills: string[];
  experienceLevel: ExperienceLevel;
  location: string;
  status: "open" | "closed";
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<JobDocument>(
  {
    recruiter: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    requiredSkills: { type: [String], default: [] },
    experienceLevel: { type: String, enum: EXPERIENCE_LEVELS, required: true },
    location: { type: String, required: true, trim: true },
    status: { type: String, enum: ["open", "closed"], default: "open" },
  },
  { timestamps: true }
);

export const JobModel = model<JobDocument>("Job", JobSchema);
