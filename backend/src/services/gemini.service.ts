import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { GEMINI_MODEL, PROMPT_VERSION, SCORING_WEIGHTS } from "../constants";
import { GeminiParseError } from "../middleware/error.middleware";
import type { ApplicantDocument } from "../models/Applicant.model";
import type { JobDocument } from "../models/Job.model";
import type { AIScreeningResult, ShortlistSize } from "../types";

/**
 * v1 prompt. Weights are mandated by the hackathon brief and are explicit
 * in the prompt so the model's scoring stays aligned with judging criteria.
 */
export const SCREENING_PROMPT_V1 = `You are an expert technical recruiter screening candidates for a specific job posting.

Scoring weights (use these EXACT weights when computing matchScore 0-100):
- Skills match: ${SCORING_WEIGHTS.skills}%
- Experience (years + seniority + industry relevance): ${SCORING_WEIGHTS.experience}%
- Education (field relevance, degree level): ${SCORING_WEIGHTS.education}%
- Projects (complexity, relevance to required skills): ${SCORING_WEIGHTS.projects}%

Rules for each candidate:
1. matchScore must be an integer 0-100 computed from the weights above.
2. strengths: up to 3 SPECIFIC, EVIDENCE-BASED points. Include numeric evidence wherever possible (e.g. "6 years of Node.js, exceeds the 4-year requirement"). Avoid generic statements like "strong candidate".
3. gaps: up to 3 specific missing/weak areas vs. the job (e.g. "No Docker experience listed", "Postgres only mentioned at Intermediate level").
4. recommendation: 1-2 sentences, specific and actionable (e.g. "Recommend for interview — deepest Postgres experience in the pool. Probe Docker production usage.").
5. skillMatchBreakdown.matched: required skills the candidate clearly has.
6. skillMatchBreakdown.missing: required skills the candidate does not have or cannot be verified.
7. rank: 1 = best fit. Ranks must be unique and consecutive starting at 1.
8. candidateId: echo back the exact externalId value provided for that candidate.

Return ONLY a valid JSON array, no markdown fences, no commentary, no prefix/suffix text.
Each item must match this schema exactly:
{
  "candidateId": string,
  "rank": number,
  "matchScore": number,
  "strengths": string[],
  "gaps": string[],
  "recommendation": string,
  "skillMatchBreakdown": { "matched": string[], "missing": string[] }
}`;

const ResultItemSchema = z.object({
  candidateId: z.string(),
  rank: z.number().int().min(1),
  matchScore: z.number().min(0).max(100),
  strengths: z.array(z.string()).max(3),
  gaps: z.array(z.string()).max(3),
  recommendation: z.string().min(1),
  skillMatchBreakdown: z.object({
    matched: z.array(z.string()),
    missing: z.array(z.string()),
  }),
});

const ResultsArraySchema = z.array(ResultItemSchema);

interface ScreenCandidatesInput {
  job: JobDocument;
  applicants: ApplicantDocument[];
  shortlistSize: ShortlistSize;
}

function buildUserPayload({ job, applicants, shortlistSize }: ScreenCandidatesInput): string {
  const jobPayload = {
    title: job.title,
    description: job.description,
    requiredSkills: job.requiredSkills,
    experienceLevel: job.experienceLevel,
    location: job.location,
  };
  const candidatePayload = applicants.map((a) => ({
    externalId: a.externalId,
    firstName: a.firstName,
    lastName: a.lastName,
    headline: a.headline,
    location: a.location,
    bio: a.bio,
    skills: a.skills,
    languages: a.languages,
    experience: a.experience,
    education: a.education,
    certifications: a.certifications,
    projects: a.projects,
    availability: a.availability,
  }));
  return JSON.stringify(
    {
      shortlistSize,
      job: jobPayload,
      candidates: candidatePayload,
    },
    null,
    2
  );
}

function stripMarkdown(text: string): string {
  let t = text.trim();
  if (t.startsWith("```")) {
    t = t.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
  }
  return t.trim();
}

async function callGemini(prompt: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set.");
  const client = new GoogleGenerativeAI(key);
  const model = client.getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  });
  const resp = await model.generateContent(prompt);
  return resp.response.text();
}

export async function screenCandidates(
  input: ScreenCandidatesInput
): Promise<AIScreeningResult[]> {
  const userPayload = buildUserPayload(input);
  const firstPrompt = `${SCREENING_PROMPT_V1}\n\nInput:\n${userPayload}`;

  let raw: string;
  try {
    raw = await callGemini(firstPrompt);
    return ResultsArraySchema.parse(JSON.parse(stripMarkdown(raw))) as AIScreeningResult[];
  } catch (first) {
    console.warn("[gemini] First attempt failed, retrying with stricter prompt:", first);
    const retryPrompt = `${firstPrompt}\n\nREMINDER: Return ONLY the JSON array described above — no markdown, no comments, no text outside the array.`;
    try {
      const retryRaw = await callGemini(retryPrompt);
      return ResultsArraySchema.parse(JSON.parse(stripMarkdown(retryRaw))) as AIScreeningResult[];
    } catch (second) {
      console.error("[gemini] Retry also failed:", second);
      throw new GeminiParseError(
        "Gemini returned an unparseable response after retry.",
        typeof second === "object" && second && "message" in second
          ? String((second as Error).message)
          : undefined
      );
    }
  }
}

export { PROMPT_VERSION };
