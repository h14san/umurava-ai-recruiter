import { Router } from "express";
import {
  CreateJobBodySchema,
  getJob,
  getListJobs,
  postCreateJob,
  deleteJob,
} from "../controllers/jobs.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";

const router = Router();
router.use(requireAuth);
router.post("/", validate(CreateJobBodySchema), postCreateJob);
router.get("/", getListJobs);
router.get("/:id", getJob);
router.delete("/:id", deleteJob);
export default router;