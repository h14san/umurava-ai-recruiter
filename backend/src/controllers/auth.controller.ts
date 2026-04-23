import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { login } from "../services/auth.service";

export const LoginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function postLogin(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const result = await login(email, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
