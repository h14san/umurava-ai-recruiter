import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";

export function validate<T>(schema: ZodSchema<T>, source: "body" | "query" | "params" = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.parse(req[source]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any)[source] = parsed;
    next();
  };
}
