import type { Response, NextFunction } from "express";
import { z } from "zod";
import { Types } from "mongoose";
import crypto from "crypto";
import { ApplicantModel } from "../models/Applicant.model";
import { JobModel } from "../models/Job.model";
import {
  SKILL_LEVELS,
  LANGUAGE_PROFICIENCIES,
  AVAILABILITY_STATUSES,
  AVAILABILITY_TYPES,
} from "../constants";
import { HttpError } from "../middleware/error.middleware";
import type { AuthedRequest } from "../types";

const ProfileSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  headline: z.string().min(1),
  bio: z.string().optional().default(""),
  location: z.string().min(1),
  skills: z.array(
    z.object({
      name: z.string().min(1),
      level: z.enum(SKILL_LEVELS),
      yearsOfExperience: z.number().min(0),
    })
  ),
  languages: z.array(
    z.object({
      name: z.string().min(1),
      proficiency: z.enum(LANGUAGE_PROFICIENCIES),
    })
  ),
  experience: z.array(
    z.object({
      company: z.string(),
      role: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      isCurrent: z.boolean(),
      description: z.string().default(""),
      technologies: z.array(z.string()).default([]),
    })
  ),
  education: z.array(
    z.object({
      institution: z.string(),
      degree: z.string(),
      fieldOfStudy: z.string(),
      startYear: z.number(),
      endYear: z.number(),
    })
  ),
  certifications: z
    .array(
      z.object({
        name: z.string(),
        issuer: z.string(),
        issueDate: z.string(),
      })
    )
    .default([]),
  projects: z
    .array(
      z.object({
        name: z.string(),
        description: z.string().default(""),
        technologies: z.array(z.string()).default([]),
        role: z.string().default(""),
        link: z.string().default(""),
        startDate: z.string().default(""),
        endDate: z.string().default(""),
      })
    )
    .default([]),
  availability: z.object({
    status: z.enum(AVAILABILITY_STATUSES),
    type: z.enum(AVAILABILITY_TYPES),
    startDate: z.string(),
  }),
  socialLinks: z
    .object({
      linkedin: z.string().default(""),
      github: z.string().default(""),
      portfolio: z.string().default(""),
    })
    .default({ linkedin: "", github: "", portfolio: "" }),
});

export const AddApplicantsBodySchema = z.union([ProfileSchema, z.array(ProfileSchema)]);

export async function postAddApplicants(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) throw new HttpError(400, "Invalid job id.");
    const recruiterId = req.user!.userId;

    const job = await JobModel.findOne({ _id: id, recruiter: recruiterId });
    if (!job) throw new HttpError(404, "Job not found.");

    const raw = req.body;
    const list = Array.isArray(raw) ? raw : [raw];

    const docs = list.map((profile) => ({
      ...profile,
      job: job._id,
      addedBy: recruiterId,
      externalId: crypto.randomUUID(),
    }));

    const inserted = await ApplicantModel.insertMany(docs, { ordered: false });
    res.status(201).json({ added: inserted.length, applicants: inserted });
  } catch (err) {
    next(err);
  }
}

export async function getListApplicants(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) throw new HttpError(400, "Invalid job id.");
    const recruiterId = req.user!.userId;

    const job = await JobModel.findOne({ _id: id, recruiter: recruiterId });
    if (!job) throw new HttpError(404, "Job not found.");

    const applicants = await ApplicantModel.find({ job: job._id }).sort({ createdAt: -1 });
    res.json(applicants);
  } catch (err) {
    next(err);
  }
}
