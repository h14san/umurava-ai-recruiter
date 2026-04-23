import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

export class HttpError extends Error {
  constructor(public status: number, message: string, public details?: unknown) {
    super(message);
  }
}

export class GeminiParseError extends Error {
  constructor(message: string, public raw?: string) {
    super(message);
  }
}

export function notFoundMiddleware(_req: Request, res: Response) {
  res.status(404).json({ error: "Not found" });
}

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Invalid request data",
      details: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    });
  }
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, details: err.details });
  }
  if (err instanceof GeminiParseError) {
    return res.status(502).json({
      error:
        "The AI returned a response we could not parse. This can happen with transient model errors. Please try again in a moment.",
    });
  }
  if (err instanceof jwt.JsonWebTokenError) {
    return res.status(401).json({ error: "Invalid or expired session. Please log in again." });
  }
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      error: "Invalid candidate or job data",
      details: Object.values(err.errors).map((e) => e.message),
    });
  }
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ error: "Invalid resource id" });
  }
  console.error("[error]", err);
  return res
    .status(500)
    .json({ error: "Something went wrong on our end. Please try again." });
}
