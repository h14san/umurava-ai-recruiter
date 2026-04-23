"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Sparkles,
  ExternalLink,
  Github,
  Linkedin,
  Globe,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { DISCLAIMER } from "@/constants";
import { cn, scoreColor, scoreLabel } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchJob } from "@/store/slices/jobsSlice";
import { fetchResults } from "@/store/slices/screeningSlice";
import type { ScreeningCandidateResult } from "@/types";

type PopulatedCandidate = Exclude<ScreeningCandidateResult["candidateId"], string>;

function populated(
  c: ScreeningCandidateResult["candidateId"]
): PopulatedCandidate | null {
  return typeof c === "string" ? null : c;
}

export default function ResultsPage() {
  const params = useParams<{ id: string }>();
  const jobId = params.id;
  const dispatch = useAppDispatch();

  const job = useAppSelector((s) => s.jobs.current);
  const resultsMap = useAppSelector((s) => s.screening.resultsByJobId);
  const result = resultsMap[jobId] ?? null;
  const screeningError = useAppSelector((s) => s.screening.error);

  useEffect(() => {
    if (!jobId) return;
    dispatch(fetchJob(jobId));
    dispatch(fetchResults(jobId));
  }, [dispatch, jobId]);

  const hasFetched = Object.prototype.hasOwnProperty.call(resultsMap, jobId);

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href={`/jobs/${jobId}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft size={14} />
        Back to job
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            {job?.title ? `${job.title} — Shortlist` : "Shortlist"}
          </h1>
          <p className="text-xs text-slate-500">{DISCLAIMER}</p>
        </div>
        {result && (
          <div className="text-right text-xs text-slate-500">
            <div>
              Top {result.shortlistSize} · model <code>{result.model}</code>
            </div>
            <div>Prompt {result.promptVersion}</div>
            <div>Generated {new Date(result.createdAt).toLocaleString()}</div>
          </div>
        )}
      </div>

      <ErrorMessage message={screeningError} />

      {!hasFetched && (
        <div className="flex justify-center py-16">
          <LoadingSpinner size={28} />
        </div>
      )}

      {hasFetched && !result && (
        <EmptyState
          icon={Sparkles}
          title="No screening run yet"
          description="Run AI screening on this job to generate a ranked shortlist."
          action={
            <Link href={`/jobs/${jobId}`}>
              <Button>Go to job</Button>
            </Link>
          }
        />
      )}

      {result && result.results.length === 0 && (
        <EmptyState
          icon={Sparkles}
          title="No candidates returned"
          description="The model did not return any matchable candidates. Review the candidate pool and try again."
        />
      )}

      {result && result.results.length > 0 && (
        <ol className="space-y-4">
          {result.results.map((r) => (
            <ResultCard key={r.externalId} r={r} />
          ))}
        </ol>
      )}
    </div>
  );
}

function ResultCard({ r }: { r: ScreeningCandidateResult }) {
  const c = populated(r.candidateId);
  const name = c ? `${c.firstName} ${c.lastName}` : "Candidate";
  const first = c?.firstName ?? "?";
  const last = c?.lastName ?? "?";

  return (
    <li className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
            {r.rank}
          </div>
          <Avatar firstName={first} lastName={last} size={40} />
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-slate-900">{name}</div>
            {c?.headline && (
              <div className="truncate text-xs text-slate-500">{c.headline}</div>
            )}
            {c?.location && (
              <div className="mt-0.5 text-xs text-slate-400">{c.location}</div>
            )}
            {c?.socialLinks && (
              <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
                {c.socialLinks.linkedin && (
                  <a
                    href={c.socialLinks.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 hover:text-brand-600"
                  >
                    <Linkedin size={12} /> LinkedIn
                  </a>
                )}
                {c.socialLinks.github && (
                  <a
                    href={c.socialLinks.github}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 hover:text-brand-600"
                  >
                    <Github size={12} /> GitHub
                  </a>
                )}
                {c.socialLinks.portfolio && (
                  <a
                    href={c.socialLinks.portfolio}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 hover:text-brand-600"
                  >
                    <Globe size={12} /> Portfolio
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <ScoreRing score={r.matchScore} />
          <span className="text-xs text-slate-500">{scoreLabel(r.matchScore)}</span>
        </div>
      </div>

      <p className="mt-4 rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700">
        <span className="font-medium text-slate-900">Recommendation: </span>
        {r.recommendation}
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Strengths
          </h4>
          <ul className="space-y-1 text-sm text-slate-700">
            {r.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-500" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
            Gaps
          </h4>
          <ul className="space-y-1 text-sm text-slate-700">
            {r.gaps.length === 0 ? (
              <li className="text-xs text-slate-400">None flagged.</li>
            ) : (
              r.gaps.map((g, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <XCircle size={14} className="mt-0.5 shrink-0 text-amber-500" />
                  <span>{g}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Skills matched
          </h4>
          <div className="flex flex-wrap gap-1">
            {r.skillMatchBreakdown.matched.length === 0 ? (
              <span className="text-xs text-slate-400">—</span>
            ) : (
              r.skillMatchBreakdown.matched.map((s) => (
                <Badge key={s} tone="success">
                  {s}
                </Badge>
              ))
            )}
          </div>
        </div>
        <div>
          <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Skills missing
          </h4>
          <div className="flex flex-wrap gap-1">
            {r.skillMatchBreakdown.missing.length === 0 ? (
              <span className="text-xs text-slate-400">—</span>
            ) : (
              r.skillMatchBreakdown.missing.map((s) => (
                <Badge key={s} tone="warning">
                  {s}
                </Badge>
              ))
            )}
          </div>
        </div>
      </div>

      {c?.email && (
        <div className="mt-4 flex items-center justify-end">
          <a
            href={`mailto:${c.email}`}
            className="inline-flex items-center gap-1 text-xs text-brand-700 hover:underline"
          >
            <ExternalLink size={12} />
            {c.email}
          </a>
        </div>
      )}
    </li>
  );
}

function ScoreRing({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full text-white",
          scoreColor(score)
        )}
      >
        <span className="text-sm font-semibold">{score}</span>
      </div>
    </div>
  );
}
