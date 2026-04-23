import type { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { HttpError } from "./error.middleware";
import type { AuthedRequest, AuthTokenPayload } from "../types";

export function requireAuth(req: AuthedRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw new HttpError(401, "Authentication required. Please log in.");
  }
  const token = header.slice("Bearer ".length).trim();
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new HttpError(500, "Server is misconfigured (missing JWT_SECRET).");
  }
  const payload = jwt.verify(token, secret) as AuthTokenPayload;
  req.user = payload;
  next();
}
