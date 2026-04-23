import { Router } from "express";
import { LoginBodySchema, postLogin } from "../controllers/auth.controller";
import { validate } from "../middleware/validate.middleware";

const router = Router();

router.post("/login", validate(LoginBodySchema), postLogin);

export default router;
