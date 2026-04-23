import type { Response, NextFunction } from "express";
import { z } from "zod";
import { SHORTLIST_SIZES, type ShortlistSize } from "../constants";
import { getLatestResults, runScreening } from "../services/screening.service";
import type { AuthedRequest } from "../types";

export const RunScreeningBodySchema = z.object({
  shortlistSize: z
    .number()
    .int()
    .refine((n): n is ShortlistSize => (SHORTLIST_SIZES as readonly number[]).includes(n), {
      message: `shortlistSize must be one of: ${SHORTLIST_SIZES.join(", ")}`,
    }),
});

export async function postRunScreening(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const recruiterId = req.user!.userId;
    const { shortlistSize } = req.body as { shortlistSize: ShortlistSize };
    const result = await runScreening({ jobId: id, recruiterId, shortlistSize });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getResults(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const recruiterId = req.user!.userId;
    const doc = await getLatestResults(id, recruiterId);
    if (!doc) {
      res.json(null);
      return;
    }
    res.json(doc);
  } catch (err) {
    next(err);
  }
}
