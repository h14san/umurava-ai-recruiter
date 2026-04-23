import { Router } from "express";
import {
  CreateJobBodySchema,
  getJob,
  getListJobs,
  postCreateJob,
} from "../controllers/jobs.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";

const router = Router();

router.use(requireAuth);
router.post("/", validate(CreateJobBodySchema), postCreateJob);
router.get("/", getListJobs);
router.get("/:id", getJob);

export default router;
