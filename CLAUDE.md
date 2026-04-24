# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Umurava AI Recruiter — a recruiter-facing tool that takes a job posting plus a pool of Umurava talent profiles and uses Google Gemini to return a ranked shortlist (top 10 or 20) with per-candidate strengths, gaps, and a hiring recommendation. Built for the Umurava AI Hackathon (see `docs/`).

The repo is split into two independently-installed Node apps:

- `backend/` — Express + Mongoose + Gemini API, TypeScript
- `frontend/` — Next.js 14 (App Router) + Redux Toolkit + Tailwind, TypeScript

They are **not** a workspace/monorepo — run `npm install` in each directory separately.

## Commands

### Backend (`cd backend`)
- `npm run dev` — start API with `ts-node-dev` (auto-restart) on `PORT` (default 4000)
- `npm run build` / `npm start` — compile to `dist/` and run the built server
- `npm run typecheck` — `tsc --noEmit`
- `npm run seed` — create the initial recruiter user from `SEED_RECRUITER_EMAIL` / `SEED_RECRUITER_PASSWORD` env vars. There is **no public signup endpoint**; recruiters only exist via this seed.

### Frontend (`cd frontend`)
- `npm run dev` — Next dev server on port 3000
- `npm run build` / `npm start`
- `npm run lint` — `next lint`
- `npm run typecheck` — `tsc --noEmit`

### No tests
Neither app has a test runner configured. Do not add mock test commands to package.json.

## Required environment

### Backend `.env`
- `MONGODB_URI` — MongoDB connection string (consumed in `src/lib/db.ts`)
- `JWT_SECRET` — required; `requireAuth` middleware 500s without it
- `GEMINI_API_KEY` — required to run screening
- `FRONTEND_URL` — CORS origin, defaults to `http://localhost:3000`
- `PORT` — defaults to 4000
- `SEED_RECRUITER_EMAIL`, `SEED_RECRUITER_PASSWORD`, `SEED_RECRUITER_NAME` — used only by `npm run seed`

### Frontend `.env.local`
- `NEXT_PUBLIC_API_URL` — defaults to `http://localhost:4000`

## Architecture

### Request flow (the one that matters)
`POST /api/jobs/:id/screen` is the product's core path. It runs in `backend/src/services/screening.service.ts`:

1. Verify the job belongs to the authed recruiter (`req.user.id`).
2. Load all `Applicant` docs for the job.
3. Call `screenCandidates()` in `gemini.service.ts`, which:
   - Builds a JSON payload of the job + candidates and concatenates it onto `SCREENING_PROMPT_V2`.
   - Calls Gemini with `responseMimeType: "application/json"` and `temperature: 0.2`.
   - Parses with Zod (`ResultsArraySchema`). On parse failure, **retries once** with a stricter "JSON only" reminder appended. A second failure throws `GeminiParseError` (502).
4. Map Gemini's `candidateId` (which is the applicant's `externalId`) back to Mongo `_id`. Unknown ids are dropped with a warning — do not throw.
5. Re-rank the survivors consecutively starting at 1 (Gemini sometimes skips/duplicates ranks) and truncate to `shortlistSize`.
6. Persist as a new `ScreeningResult` document. Each screen run creates a new result; `GET /api/jobs/:id/results` returns the latest by `createdAt`.

### Scoring weights are load-bearing
`backend/src/constants/index.ts` defines `SCORING_WEIGHTS` (skills 40 / experience 25 / education 15 / projects 20). These are **hackathon-mandated** and are interpolated into the prompt so judging criteria stay aligned with Gemini's output. Don't change them casually.

Also pinned there: `GEMINI_MODEL` and `PROMPT_VERSION` (currently `v2`). Both are stored on each `ScreeningResult` so past runs remain attributable if the model/prompt changes.

### Route layout
All routes except `/api/auth/login` require `requireAuth` (Bearer JWT). Applicant and screening routes are nested under `/api/jobs/:id/*` but mounted as separate routers in `backend/src/index.ts`:

```
/api/auth/login                        (public)
/api/jobs                              POST, GET
/api/jobs/:id                          GET
/api/jobs/:id/applicants               POST, GET
/api/jobs/:id/screen                   POST
/api/jobs/:id/results                  GET
```

Each feature follows the same layering: `routes/ → middleware/validate (Zod) → controllers/ → services/ → models/`. Zod schemas live on the controller and are re-exported to the route for `validate(schema)`.

### Data model
- `User` (role: `recruiter`) — seeded only, login-only
- `Job` — owned by a recruiter
- `Applicant` — owned by a job; `externalId` is the upstream Umurava profile id and uniquely pairs with `job` (see the compound index in `Applicant.model.ts`). The schema embeds the full `UmuravaProfile` shape (skills, experience, education, certifications, projects, availability, socialLinks).
- `ScreeningResult` — one per screen run, embeds the ranked results array plus `model`/`promptVersion` for provenance.

The canonical profile JSON shape is documented in `docs/Talent Profile Schema Specification.pdf` and demonstrated by `data/dummy-profiles/profile-01.json` … `profile-20.json`. These 20 files are the fixture data for end-to-end testing the screening flow.

### Frontend state + auth
- Redux store (`frontend/store/index.ts`) has four slices: `auth`, `jobs`, `applicants`, `screening`. API calls live in `frontend/lib/api.ts` — the slices should dispatch these, not fetch directly.
- Auth is dual-tracked: the JWT is stored under `AUTH_STORAGE_KEY` (`umurava_auth`) in `localStorage` and read by `api.ts` for the `Authorization` header; a separate `umurava_authed=1` cookie is what `frontend/middleware.ts` checks to gate `/jobs/*` and redirect `/login`. When implementing login/logout, both must be written/cleared together or the middleware and the API client will disagree.
- Path alias `@/*` resolves to the `frontend/` root (see `tsconfig.json`).

### Frontend UI is partially scaffolded
`frontend/components/ui/` has a primitive library (Button, Modal, Sidebar, etc.). `frontend/components/jobs/` has `JobCard`/`JobList`. The route directories `app/login/`, `app/jobs/new/`, `app/jobs/[id]/results/` exist but have no `page.tsx` yet — the API client, store, and types are in place ahead of the pages. Expect to be adding `page.tsx` files rather than retrofitting.

## Conventions worth knowing

- **Errors**: throw `HttpError(status, message)` (or `GeminiParseError`) from `middleware/error.middleware.ts` rather than calling `res.status().json()`. The error middleware formats the response.
- **IDs**: Validate Mongo ids with `Types.ObjectId.isValid` before querying — services do this and throw 400 for bad ids.
- **Gemini output is untrusted**: always Zod-parse it, always map `candidateId` back through the `externalId → applicant` map, never trust the rank numbers.
- **Shortlist size is an enum**, not a free integer: `SHORTLIST_SIZES = [10, 20]` in both backend and frontend constants. Keep them in sync if changed.
