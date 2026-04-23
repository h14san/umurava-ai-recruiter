import { Types } from "mongoose";
import { JobModel } from "../models/Job.model";
import { ApplicantModel } from "../models/Applicant.model";
import { ScreeningResultModel } from "../models/ScreeningResult.model";
import { screenCandidates } from "./gemini.service";
import { HttpError } from "../middleware/error.middleware";
import { PROMPT_VERSION, GEMINI_MODEL, type ShortlistSize } from "../constants";

interface RunScreeningArgs {
  jobId: string;
  recruiterId: string;
  shortlistSize: ShortlistSize;
}

export async function runScreening({ jobId, recruiterId, shortlistSize }: RunScreeningArgs) {
  if (!Types.ObjectId.isValid(jobId)) {
    throw new HttpError(400, "Invalid job id.");
  }

  const job = await JobModel.findOne({ _id: jobId, recruiter: recruiterId });
  if (!job) throw new HttpError(404, "Job not found.");

  const applicants = await ApplicantModel.find({ job: jobId });
  if (applicants.length === 0) {
    throw new HttpError(400, "Add candidates before running screening.");
  }

  const aiResults = await screenCandidates({ job, applicants, shortlistSize });

  const byExternalId = new Map(applicants.map((a) => [a.externalId, a]));

  const mapped = aiResults
    .map((r) => {
      const applicant = byExternalId.get(r.candidateId);
      if (!applicant) {
        console.warn(`[screening] Gemini returned unknown externalId=${r.candidateId}, skipping`);
        return null;
      }
      return {
        candidateId: applicant._id,
        externalId: applicant.externalId,
        rank: r.rank,
        matchScore: r.matchScore,
        strengths: r.strengths,
        gaps: r.gaps,
        recommendation: r.recommendation,
        skillMatchBreakdown: r.skillMatchBreakdown,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null)
    .sort((a, b) => a.rank - b.rank)
    .slice(0, shortlistSize);

  if (mapped.length === 0) {
    throw new HttpError(
      502,
      "AI returned no matchable candidates. Please try again or check candidate data."
    );
  }

  // Re-rank consecutively in case Gemini skipped or duplicated numbers.
  mapped.forEach((r, i) => {
    r.rank = i + 1;
  });

  const doc = await ScreeningResultModel.create({
    job: job._id,
    shortlistSize,
    model: GEMINI_MODEL,
    promptVersion: PROMPT_VERSION,
    results: mapped,
  });
  return doc;
}

export async function getLatestResults(jobId: string, recruiterId: string) {
  if (!Types.ObjectId.isValid(jobId)) throw new HttpError(400, "Invalid job id.");
  const job = await JobModel.findOne({ _id: jobId, recruiter: recruiterId });
  if (!job) throw new HttpError(404, "Job not found.");

  const latest = await ScreeningResultModel.findOne({ job: jobId })
    .sort({ createdAt: -1 })
    .populate({
      path: "results.candidateId",
      select: "firstName lastName headline location email skills socialLinks externalId",
    });
  return latest;
}
