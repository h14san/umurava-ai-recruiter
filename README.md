# Umurava AI Recruiter

Recruiter-facing tool that takes a job posting plus a pool of Umurava talent profiles and uses Google Gemini to return a ranked shortlist (Top 10 or Top 20) with per-candidate match score, sub-scores, strengths, gaps, and a hiring recommendation. Built for the Umurava AI Hackathon.

## Architecture

```
+-------------------------+        +-------------------------+        +-------------------+
|   Frontend (Next.js)    |  HTTPS |   Backend (Express/TS)  |  HTTPS |   Gemini API      |
|   App Router · Redux    +------->+   REST API · Mongoose   +------->+   gemini-2.5-     |
|   Toolkit · Tailwind    |        |   JWT auth · Zod        |        |   flash           |
+-----------+-------------+        +-----------+-------------+        +-------------------+
            |                                  |
            | localStorage JWT                 | Mongoose
            v                                  v
   /jobs/* gated by middleware         +-------------------+
   reads `umurava_authed` cookie       |   MongoDB Atlas   |
                                       |   Jobs · Apps ·   |
                                       |   ScreeningResult |
                                       +-------------------+
```

Two independent Node apps (not a workspace):

- `backend/` — Express + Mongoose + Gemini SDK, TypeScript
- `frontend/` — Next.js 14 (App Router) + Redux Toolkit + Tailwind, TypeScript
- `data/dummy-profiles/` — 20 fixture profiles matching the Talent Profile Schema
- `docs/` — hackathon brief and schema spec

Each feature on the backend follows the same layering: `routes/ → middleware/validate (Zod) → controllers/ → services/ → models/`.

## Setup

Install dependencies in each app separately:

```bash
cd backend  && npm install
cd ../frontend && npm install
```

### Run locally

```bash
# Terminal 1 — backend on :4000
cd backend
npm run dev

# Terminal 2 — frontend on :3000
cd frontend
npm run dev
```

There is **no public signup endpoint**. Seed the recruiter user once before logging in:

```bash
cd backend
npm run seed
```

Then log in at http://localhost:3000/login with `SEED_RECRUITER_EMAIL` / `SEED_RECRUITER_PASSWORD`.

### Useful scripts

Backend: `npm run dev` · `npm run build` · `npm start` · `npm run typecheck` · `npm run seed`
Frontend: `npm run dev` · `npm run build` · `npm start` · `npm run lint` · `npm run typecheck`

## Environment variables

### `backend/.env`

| Variable | Required | Description |
| --- | --- | --- |
| `MONGODB_URI` | yes | MongoDB connection string |
| `JWT_SECRET` | yes | Secret used to sign auth tokens; `requireAuth` returns 500 if missing |
| `GEMINI_API_KEY` | yes | Google Generative AI key, used by the screening service |
| `FRONTEND_URL` | no | CORS origin, defaults to `http://localhost:3000` |
| `PORT` | no | Defaults to `4000` |
| `SEED_RECRUITER_EMAIL` | seed only | Email for the seeded recruiter |
| `SEED_RECRUITER_PASSWORD` | seed only | Password for the seeded recruiter |
| `SEED_RECRUITER_NAME` | seed only | Display name |

### `frontend/.env.local`

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | no | Backend base URL, defaults to `http://localhost:4000` |

## API surface

```
POST   /api/auth/login                    public
GET    /api/jobs                          recruiter
POST   /api/jobs                          recruiter
GET    /api/jobs/:id                      recruiter
POST   /api/jobs/:id/applicants           recruiter
GET    /api/jobs/:id/applicants           recruiter
POST   /api/jobs/:id/screen               recruiter   (Gemini)
GET    /api/jobs/:id/results              recruiter   (latest run)
```

All non-auth routes require a `Bearer` JWT.

## AI decision flow

The product's core path is `POST /api/jobs/:id/screen`, implemented in `backend/src/services/screening.service.ts`:

1. **Authorize** — verify the job belongs to the requesting recruiter.
2. **Gather** — load every `Applicant` for the job from Mongo.
3. **Prompt** — `gemini.service.ts` builds a JSON payload (`job` + `candidates`) and concatenates it onto `SCREENING_PROMPT_V2` (v2 adds an explicit fairness clause that instructs Gemini to score only on job-relevant evidence and ignore protected characteristics).
4. **Call Gemini** — `gemini-2.5-flash` with `responseMimeType: "application/json"` and `temperature: 0.2`.
5. **Validate** — Zod-parse the response. On parse failure, retry **once** with a stricter "JSON only" reminder appended. A second failure surfaces as a 502 (`GeminiParseError`).
6. **Map back** — Gemini echoes back our `externalId`. Each item is resolved to a Mongo `_id`; unknown ids are dropped with a warning rather than throwing.
7. **Re-rank & truncate** — survivors get consecutive ranks starting at 1, then are truncated to `shortlistSize` (10 or 20).
8. **Persist** — a new `ScreeningResult` doc is created with `model`, `promptVersion`, and the ranked array. Each screen is a new run; `GET /results` returns the latest by `createdAt`.

### Scoring weights (mandated by the brief)

`backend/src/constants/index.ts` defines:

```ts
SCORING_WEIGHTS = { skills: 40, experience: 25, education: 15, projects: 20 }
```

These weights are interpolated into the prompt so Gemini scores each dimension on a 0–100 scale and the overall `matchScore` is the weighted average. The model returns:

```jsonc
{
  "candidateId": "<externalId>",
  "rank": 1,
  "matchScore": 86,
  "subScores": { "skills": 92, "experience": 80, "education": 70, "projects": 88 },
  "strengths": ["..."],
  "gaps": ["..."],
  "recommendation": "...",
  "skillMatchBreakdown": { "matched": ["..."], "missing": ["..."] }
}
```

The recruiter UI surfaces all of this on `/jobs/:id/results`: card view with sub-score bars, a compact table view, CSV export, and per-candidate copy-summary.

## Assumptions and limitations

- **Single recruiter, seeded only.** No public signup; the recruiter is created via `npm run seed`. This matches the hackathon scope (single-tenant prototype).
- **Scenario 1 only.** The system implements structured-profile screening (Scenario 1 in the technical guide). CSV/PDF/resume-link ingestion (Scenario 2) is out of scope for this submission.
- **Gemini output is untrusted.** Every response is Zod-validated. If the model returns ranks that skip or duplicate, the service re-ranks consecutively. If it returns an `externalId` we don't recognize, that entry is dropped.
- **Each screen is a new run.** History is preserved (every `ScreeningResult` doc keeps `model` + `promptVersion`), but the UI shows only the most recent run.
- **Hackathon-mandated weights.** The 40/25/15/20 split is fixed and embedded in the prompt; changing it would invalidate alignment with the judging criteria.
- **Non-determinism.** Even at `temperature: 0.2`, Gemini may produce slightly different scores between runs. Prompt + model versions are stored on each result for traceability.
- **Token / size limits.** Very large applicant pools may exceed the model's context window. The prototype assumes pools in the hundreds, not thousands; production would batch.
- **Human-in-the-loop.** The system is decision-support, not decision-making. The UI carries a disclaimer reminding recruiters that final hiring decisions are theirs.

## Deployment

- **Frontend:** Vercel (Next.js).
- **Backend:** Render (Express isn't a fit for Vercel's serverless model without rework).
- **Database:** MongoDB Atlas.

### 1. MongoDB Atlas

1. Create a free cluster.
2. Add a database user, copy the SRV connection string (`mongodb+srv://…`).
3. Network Access → allow `0.0.0.0/0` (or restrict to Render's egress IPs once known).

### 2. Backend on Render

A `render.yaml` is provided at the repo root.

1. Connect this repo on render.com and let Render detect `render.yaml`.
2. Fill the four secret env vars on the dashboard (`MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `FRONTEND_URL`). Leave `FRONTEND_URL` as a placeholder for now — you'll fill it once Vercel gives you a URL in step 3, then redeploy.
3. After the first successful deploy, hit `https://<your-service>.onrender.com/api/health` — should return `{ "status": "ok", … }`.
4. Seed the recruiter user: open the Render shell and run `npm run seed` (it reads `SEED_RECRUITER_EMAIL` / `SEED_RECRUITER_PASSWORD` / `SEED_RECRUITER_NAME` from env, so add them temporarily, run, then remove).

### 3. Frontend on Vercel

1. Import this repo on vercel.com.
2. **Root Directory:** `frontend` (Vercel will auto-detect Next.js).
3. Environment variable: `NEXT_PUBLIC_API_URL = https://<your-service>.onrender.com`.
4. Deploy. Copy the resulting URL.
5. Back on Render, set `FRONTEND_URL` to the Vercel URL and redeploy the backend so CORS allows it.

### 4. Verify

- Open the Vercel URL → log in with the seeded recruiter → create a job → add applicants (paste profiles from `data/dummy-profiles/`) → run screening → the results page should render the ranked shortlist with sub-scores, table view, and CSV export.
