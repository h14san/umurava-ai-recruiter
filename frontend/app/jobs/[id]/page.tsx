"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { CheckCircle2, Loader2, Users } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ScoreBar } from "@/components/ui/ScoreBar";
import { fullName } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchApplicants } from "@/store/slices/applicantsSlice";
import { fetchJob } from "@/store/slices/jobsSlice";
import { fetchResults, reset } from "@/store/slices/screeningSlice";

const STEP_LABEL: Record<string, string> = {
  loading_job: "Loading candidate profiles",
  calling_gemini: "Sending to Gemini API",
  parsing: "Analyzing and scoring",
  saving: "Building shortlist",
  done: "Generating reasoning",
};

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const jobId = params.id;
  const dispatch = useAppDispatch();

  const job = useAppSelector((state) => state.jobs.current);
  const jobsStatus = useAppSelector((state) => state.jobs.status);
  const jobsError = useAppSelector((state) => state.jobs.error);
  const applicants = useAppSelector((state) => state.applicants.byJobId[jobId] ?? []);
  const applicantsStatus = useAppSelector((state) => state.applicants.status);
  const screeningStatus = useAppSelector((state) => state.screening.status);
  const screeningStep = useAppSelector((state) => state.screening.step);
  const screeningError = useAppSelector((state) => state.screening.error);
  const results = useAppSelector((state) => state.screening.resultsByJobId[jobId] ?? null);

  useEffect(() => {
    if (!jobId) return;
    void dispatch(fetchJob(jobId));
    void dispatch(fetchApplicants(jobId));
    void dispatch(fetchResults(jobId));
    dispatch(reset());
  }, [dispatch, jobId]);

  const shownJob = job && job._id === jobId ? job : null;

  if (jobsStatus === "loading" && !shownJob) {
    return (
      <div className="flex min-h-full items-center justify-center py-16">
        <LoadingSpinner size={28} />
      </div>
    );
  }

  if (!shownJob) {
    return (
      <div className="px-4 py-6 md:px-6">
        <ErrorMessage message={jobsError ?? "Job not found."} />
      </div>
    );
  }

  if (screeningStatus === "running") {
    const steps = ["loading_job", "calling_gemini", "parsing", "saving", "done"] as const;
    const activeIndex = steps.indexOf(screeningStep as (typeof steps)[number]);

    return (
      <div className="flex min-h-full items-center justify-center px-4 py-6 md:px-6">
        <div className="app-panel w-full max-w-[400px] p-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-app bg-[var(--surface-soft)]">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-app border-t-[var(--accent)]" />
          </div>
          <h1 className="text-[18px]">Screening in progress</h1>
          <p className="mt-2 text-sm text-muted">
            Gemini is analyzing {applicants.length} candidates against your job requirements
          </p>

          <div className="mt-6 space-y-3 text-left">
            {steps.map((step, index) => {
              const state =
                index < activeIndex
                  ? "done"
                  : index === activeIndex
                    ? "active"
                    : "waiting";
              return (
                <div
                  key={step}
                  className="flex items-center justify-between gap-3 rounded-[12px] border border-app px-3 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={
                        state === "done"
                          ? "flex h-6 w-6 items-center justify-center rounded-full bg-[var(--success)] text-white"
                          : state === "active"
                            ? "flex h-6 w-6 items-center justify-center rounded-full border border-[var(--accent)] text-[var(--accent)] animate-pulse"
                            : "flex h-6 w-6 items-center justify-center rounded-full bg-[var(--surface-muted)] text-muted"
                      }
                    >
                      {state === "done" ? (
                        <CheckCircle2 size={14} />
                      ) : state === "active" ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : null}
                    </span>
                    <span className={state === "active" ? "font-medium text-primary" : "text-sm text-muted"}>
                      {STEP_LABEL[step]}
                    </span>
                  </div>
                  <span
                    className={
                      state === "done"
                        ? "text-xs font-medium text-[var(--success)]"
                        : state === "active"
                          ? "text-xs font-medium text-[var(--accent)]"
                          : "text-xs text-muted"
                    }
                  >
                    {state === "done" ? "Complete" : state === "active" ? "Processing..." : "Waiting"}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="mt-5 text-xs text-muted">Usually takes 8-15 seconds</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col px-4 py-5 md:px-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 text-xs uppercase tracking-[0.18em] text-muted">Job workspace</div>
          <h1 className="text-[20px]">{shownJob.title}</h1>
          <p className="mt-2 text-sm text-muted">
            Manage candidates in the center, use the right panel for job context and screening.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/jobs">
            <Button variant="ghost">All jobs</Button>
          </Link>
          <Link href={`/jobs/${jobId}/results`}>
            <Button variant="outlined" disabled={!results}>
              View results
            </Button>
          </Link>
        </div>
      </div>

      <div className="mb-6 grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <section className="app-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-muted">Role summary</div>
              <h2 className="mt-2 text-lg">{shownJob.title}</h2>
            </div>
            <Badge tone={results ? "success" : "warning"}>{results ? "Screened" : "Pending"}</Badge>
          </div>
          <p className="mt-4 line-clamp-4 text-sm text-muted">{shownJob.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {shownJob.requiredSkills.map((skill) => (
              <Badge key={skill} tone="skill">
                {skill}
              </Badge>
            ))}
          </div>
        </section>

        <section className="app-card p-5">
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted">Pipeline snapshot</div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <SnapshotCard label="Candidates" value={String(applicants.length)} tone="neutral" />
            <SnapshotCard label="Shortlist" value={results ? String(results.shortlistSize) : "--"} tone="accent" />
            <SnapshotCard label="Top Score" value={results ? String(results.results[0]?.matchScore ?? 0) : "--"} tone="accent" />
            <SnapshotCard label="Status" value={results ? "Ready" : "Idle"} tone={results ? "success" : "neutral"} />
          </div>
        </section>
      </div>

      <section className="app-card flex-1 p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-base">Candidates</h2>
            <p className="text-xs text-muted">
              {applicants.length} profile{applicants.length === 1 ? "" : "s"} connected to this job
            </p>
          </div>
          <Link href={`/jobs/${jobId}/results`}>
            <Button variant="ghost" disabled={!results}>
              Open results
            </Button>
          </Link>
        </div>

        {applicantsStatus === "loading" && applicants.length === 0 && (
          <div className="flex justify-center py-8">
            <LoadingSpinner size={22} />
          </div>
        )}

        {applicants.length === 0 && applicantsStatus !== "loading" && (
          <EmptyState
            icon={Users}
            title="No candidates yet"
            description="Use the right panel to paste JSON profiles or load the demo data set."
          />
        )}

        {applicants.length > 0 && (
          <div className="grid gap-3 lg:grid-cols-2">
            {applicants.map((candidate) => (
              <div key={candidate._id} className="rounded-[12px] border border-app bg-[var(--surface-soft)] p-4">
                <div className="flex items-center gap-3">
                  <Avatar firstName={candidate.firstName} lastName={candidate.lastName} size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-primary">
                      {fullName(candidate.firstName, candidate.lastName)}
                    </div>
                    <div className="truncate text-xs text-muted">{candidate.headline}</div>
                  </div>
                  <Badge tone="neutral">{candidate.availability?.status ?? "Unknown"}</Badge>
                </div>
                <div className="mt-4 text-xs text-muted">{candidate.location}</div>
                <div className="mt-3">
                  <ScoreBar
                    score={
                      results?.results.find((entry) => entry.externalId === candidate.externalId)
                        ?.matchScore ?? 0
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <ErrorMessage message={screeningError} />
    </div>
  );
}

function SnapshotCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "neutral" | "accent" | "success";
}) {
  const toneClass =
    tone === "accent"
      ? "text-[var(--accent)]"
      : tone === "success"
        ? "text-[var(--success)]"
        : "text-primary";

  return (
    <div className="rounded-[12px] border border-app bg-[var(--surface-soft)] p-3">
      <div className="text-[11px] uppercase tracking-[0.18em] text-muted leading-tight break-words">{label}</div>
      <div className={`mt-2 text-xl font-semibold ${toneClass}`}>{value}</div>
    </div>
  );
}
