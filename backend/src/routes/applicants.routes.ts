import { Router } from "express";
import {
  AddApplicantsBodySchema,
  getListApplicants,
  postAddApplicants,
} from "../controllers/applicants.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";

const router = Router();

router.use(requireAuth);
router.post("/:id/applicants", validate(AddApplicantsBodySchema), postAddApplicants);
router.get("/:id/applicants", getListApplicants);

export default router;
