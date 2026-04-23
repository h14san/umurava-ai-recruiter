import { Schema, model, Document, Types } from "mongoose";
import { GEMINI_MODEL, PROMPT_VERSION, SHORTLIST_SIZES, type ShortlistSize } from "../constants";

export interface ScreeningCandidateResult {
  candidateId: Types.ObjectId;
  externalId: string;
  rank: number;
  matchScore: number;
  strengths: string[];
  gaps: string[];
  recommendation: string;
  skillMatchBreakdown: {
    matched: string[];
    missing: string[];
  };
}

export interface ScreeningResultDocument extends Omit<Document, "model"> {
  _id: Types.ObjectId;
  job: Types.ObjectId;
  shortlistSize: ShortlistSize;
  model: string;
  promptVersion: string;
  results: ScreeningCandidateResult[];
  createdAt: Date;
  updatedAt: Date;
}

const CandidateResultSchema = new Schema<ScreeningCandidateResult>(
  {
    candidateId: { type: Schema.Types.ObjectId, ref: "Applicant", required: true },
    externalId: { type: String, required: true },
    rank: { type: Number, required: true, min: 1 },
    matchScore: { type: Number, required: true, min: 0, max: 100 },
    strengths: { type: [String], default: [] },
    gaps: { type: [String], default: [] },
    recommendation: { type: String, required: true },
    skillMatchBreakdown: {
      matched: { type: [String], default: [] },
      missing: { type: [String], default: [] },
    },
  },
  { _id: false }
);

const ScreeningResultSchema = new Schema<ScreeningResultDocument>(
  {
    job: { type: Schema.Types.ObjectId, ref: "Job", required: true, index: true },
    shortlistSize: { type: Number, enum: SHORTLIST_SIZES, required: true },
    model: { type: String, default: GEMINI_MODEL },
    promptVersion: { type: String, default: PROMPT_VERSION },
    results: { type: [CandidateResultSchema], default: [] },
  },
  { timestamps: true }
);

export const ScreeningResultModel = model<ScreeningResultDocument>(
  "ScreeningResult",
  ScreeningResultSchema
);
