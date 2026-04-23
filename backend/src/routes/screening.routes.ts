import { Router } from "express";
import {
  RunScreeningBodySchema,
  getResults,
  postRunScreening,
} from "../controllers/screening.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";

const router = Router();

router.use(requireAuth);
router.post("/:id/screen", validate(RunScreeningBodySchema), postRunScreening);
router.get("/:id/results", getResults);

export default router;
