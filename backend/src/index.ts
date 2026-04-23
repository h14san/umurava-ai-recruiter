import "dotenv/config";
import express, { type Request, type Response } from "express";
import cors from "cors";
import morgan from "morgan";

import { connectDB } from "./lib/db";
import authRoutes from "./routes/auth.routes";
import jobsRoutes from "./routes/jobs.routes";
import applicantsRoutes from "./routes/applicants.routes";
import screeningRoutes from "./routes/screening.routes";
import { errorMiddleware, notFoundMiddleware } from "./middleware/error.middleware";

const PORT = Number(process.env.PORT ?? 4000);
const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:3000";

async function main() {
  await connectDB();

  const app = express();

  app.use(
    cors({
      origin: FRONTEND_URL,
      credentials: true,
    })
  );
  app.use(express.json({ limit: "5mb" }));
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", service: "umurava-ai-recruiter-backend" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/jobs", jobsRoutes);
  // Applicant + screening routes are nested under /api/jobs/:id/*
  app.use("/api/jobs", applicantsRoutes);
  app.use("/api/jobs", screeningRoutes);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  app.listen(PORT, () => {
    console.log(`[server] Listening on http://localhost:${PORT}`);
    console.log(`[server] Allowed origin: ${FRONTEND_URL}`);
  });
}

main().catch((err) => {
  console.error("[server] Fatal startup error:", err);
  process.exit(1);
});
