import type { Response, NextFunction } from "express";
import { z } from "zod";
import { Types } from "mongoose";
import { JobModel } from "../models/Job.model";
import { EXPERIENCE_LEVELS } from "../constants";
import { HttpError } from "../middleware/error.middleware";
import type { AuthedRequest } from "../types";

export const CreateJobBodySchema = z.object({
  title: z.string().min(2),
  description: z.string().min(10),
  requiredSkills: z.array(z.string().min(1)).min(1),
  experienceLevel: z.enum(EXPERIENCE_LEVELS),
  location: z.string().min(1),
});

export async function postCreateJob(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const recruiterId = req.user!.userId;
    const job = await JobModel.create({ ...req.body, recruiter: recruiterId });
    res.status(201).json(job);
  } catch (err) {
    next(err);
  }
}

export async function getListJobs(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const recruiterId = req.user!.userId;
    const jobs = await JobModel.find({ recruiter: recruiterId }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    next(err);
  }
}

export async function getJob(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) throw new HttpError(400, "Invalid job id.");
    const recruiterId = req.user!.userId;
    const job = await JobModel.findOne({ _id: id, recruiter: recruiterId });
    if (!job) throw new HttpError(404, "Job not found.");
    res.json(job);
  } catch (err) {
    next(err);
  }
}
