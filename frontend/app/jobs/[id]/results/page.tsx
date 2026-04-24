"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Briefcase,
  CheckCircle2,
  ChevronDown,
  Copy,
  Download,
  ExternalLink,
  Globe,
  GraduationCap,
  LayoutGrid,
  Linkedin,
  List,
  Medal,
  Sparkles,
  XCircle,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ScoreBar } from "@/components/ui/ScoreBar";
import { StarRating } from "@/components/ui/StarRating";
import { DISCLAIMER } from "@/constants";
import {
  cn,
  downloadCsv,
  fullName,
  rowsToCsv,
  scoreLabel,
  scoreTier,
  slugify,
  type CsvRow,
} from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchApplicants } from "@/store/slices/applicantsSlice";
import { fetchJob } from "@/store/slices/jobsSlice";
import { fetchResults } from "@/store/slices/screeningSlice";
import type { Applicant, ScreeningCandidateResult } from "@/types";

type Filter = "all" | "strong" | "partial" | "weak";
type Sort = "rank" | "score" | "name";
type View = "cards" | "table";

const WEIGHTS = { skills: 40, experience: 25, education: 15, projects: 20 } as const;
const SUB_SCORE_FIELDS: Array<{ key: keyof typeof WEIGHTS; label: string }> = [
  { key: "skills", label: "Skills" },
  { key: "experience", label: "Experience" },
  { key: "education", label: "Education" },
  { key: "projects", label: "Projects" },
];

const filterItems: Array<{ key: Filter; label: string }> = [
  { key: "all", label: "All" },
  { key: "strong", label: "Strong (>80)" },
  { key: "partial", label: "Partial (60-79)" },
  { key: "weak", label: "Weak (<60)" },
];

export default function ResultsPage() {
  const params = useParams<{ id: string }>();
  const jobId = params.id;
  const dispatch = useAppDispatch();

  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("rank");
  const [view, setView] = useState<View>("cards");

  const job = useAppSelector((state) =>
    state.jobs.current && state.jobs.current._id === jobId ? state.jobs.current : null
  );
  const resultsMap = useAppSelector((state) => state.screening.resultsByJobId);
  const result = resultsMap[jobId] ?? null;
  const applicants = useAppSelector((state) => state.applicants.byJobId[jobId] ?? []);
  const screeningError = useAppSelector((state) => state.screening.error);

  useEffect(() => {
    if (!jobId) return;
    void dispatch(fetchJob(jobId));
    void dispatch(fetchResults(jobId));
    void dispatch(fetchApplicants(jobId));
  }, [dispatch, jobId]);

  const hasFetched = Object.prototype.hasOwnProperty.call(resultsMap, jobId);

  const filteredResults = useMemo(() => {
    if (!result) return [];

    const visible = result.results.filter((entry) => {
      const tier = scoreTier(entry.matchScore);
      if (filter === "all") return true;
      return tier === filter;
    });

    return visible.sort((left, right) => {
      if (sort === "score") return right.matchScore - left.matchScore;
      if (sort === "name") {
        return candidateName(left, applicants).localeCompare(candidateName(right, applicants));
      }
      return left.rank - right.rank;
    });
  }, [applicants, filter, result, sort]);

  const handleExportCsv = () => {
    if (!result || filteredResults.length === 0) return;
    const rows: CsvRow[] = filteredResults.map((entry) => {
      const applicant = resolveApplicant(entry, applicants);
      return {
        rank: entry.rank,
        name: candidateName(entry, applicants),
        email: applicant?.email ?? "",
        matchScore: entry.matchScore,
        skills: entry.subScores?.skills ?? 0,
        experience: entry.subScores?.experience ?? 0,
        education: entry.subScores?.education ?? 0,
        projects: entry.subScores?.projects ?? 0,
        matched: entry.skillMatchBreakdown.matched.join("; "),
        missing: entry.skillMatchBreakdown.missing.join("; "),
        strengths: entry.strengths.join("; "),
        gaps: entry.gaps.join("; "),
        recommendation: entry.recommendation,
      };
    });
    const csv = rowsToCsv(rows);
    const filename = `${slugify(job?.title ?? "shortlist")}-shortlist.csv`;
    downloadCsv(filename, csv);
    toast.success(`Exported ${rows.length} candidates`);
  };

  const metrics = useMemo(() => {
    if (!result || result.results.length === 0) return null;
    const scores = result.results.map((item) => item.matchScore);
    const shortlisted = result.results.filter((item) => item.matchScore >= 80).length;
    const total = result.results.length;
    const average = Math.round(scores.reduce((sum, current) => sum + current, 0) / scores.length);
    const top = Math.max(...scores);
    return { total, shortlisted, average, top };
  }, [result]);

  return (
    <div className="flex min-h-full flex-col px-4 py-5 md:px-6">
      <div className="mb-6">
        <div className="text-xs uppercase tracking-[0.18em] text-muted">
          Jobs / {job?.title ?? "Role"} / Results
        </div>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[22px]">{job?.title ?? "Screening Results"}</h1>
            {result && (
              <div className="mt-1 text-sm text-muted">
                Screened {new Date(result.createdAt).toLocaleDateString()} · {result.results.length} candidates
              </div>
            )}
          </div>
          {result && result.results.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-[999px] border border-app p-1">
                <ViewToggleButton
                  active={view === "cards"}
                  onClick={() => setView("cards")}
                  icon={LayoutGrid}
                  label="Cards"
                />
                <ViewToggleButton
                  active={view === "table"}
                  onClick={() => setView("table")}
                  icon={List}
                  label="Table"
                />
              </div>
              <Button variant="outlined" size="sm" onClick={handleExportCsv}>
                <Download size={14} />
                Export CSV
              </Button>
            </div>
          )}
        </div>
      </div>

      <ErrorMessage message={screeningError} />

      {!hasFetched && (
        <div className="flex flex-1 items-center justify-center py-16">
          <LoadingSpinner size={28} />
        </div>
      )}

      {hasFetched && !result && (
        <div className="flex flex-1 items-center justify-center">
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
        </div>
      )}

      {result && result.results.length === 0 && (
        <div className="flex flex-1 items-center justify-center">
          <EmptyState
            icon={Sparkles}
            title="No candidates returned"
            description="The model did not return any matchable candidates. Review the candidate pool and try again."
          />
        </div>
      )}

      {result && result.results.length > 0 && (
        <>
          {metrics && (
            <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Total applicants" value={String(metrics.total)} />
              <MetricCard label="Shortlisted" value={String(metrics.shortlisted)} tone="success" />
              <MetricCard label="Avg score" value={`${metrics.average}`} tone="accent" />
              <MetricCard label="Top score" value={`${metrics.top}`} tone="accent" />
            </div>
          )}

          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {filterItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setFilter(item.key)}
                  className={
                    filter === item.key
                      ? "rounded-[999px] border border-[var(--accent)] bg-[var(--accent)] px-3 py-2 text-xs font-medium text-white"
                      : "rounded-[999px] border border-app px-3 py-2 text-xs font-medium text-muted"
                  }
                >
                  {item.label}
                </button>
              ))}
            </div>

            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as Sort)}
              className="app-input max-w-[180px] px-3 text-sm"
            >
              <option value="rank">Rank</option>
              <option value="score">Score</option>
              <option value="name">Name</option>
            </select>
          </div>

          {view === "cards" ? (
            <div className="space-y-4 pb-20">
              {filteredResults.map((entry) => (
                <ResultCard
                  key={entry.externalId}
                  entry={entry}
                  applicant={resolveApplicant(entry, applicants)}
                />
              ))}
            </div>
          ) : (
            <ResultsTable entries={filteredResults} applicants={applicants} />
          )}
        </>
      )}

      <div className="sticky bottom-0 mt-auto border-t border-app bg-app px-4 py-3 text-center text-xs italic text-muted md:px-0">
        {DISCLAIMER}
      </div>
    </div>
  );
}

function ResultCard({
  entry,
  applicant,
}: {
  entry: ScreeningCandidateResult;
  applicant: Applicant | null;
}) {
  const [showWhy, setShowWhy] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const name = applicant
    ? fullName(applicant.firstName, applicant.lastName)
    : candidateName(entry, []);
  const headline =
    applicant?.headline ??
    (typeof entry.candidateId === "string" ? "Candidate profile" : entry.candidateId.headline);
  const location =
    applicant?.location ??
    (typeof entry.candidateId === "string" ? "Unknown" : entry.candidateId.location);
  const initialsSource = applicant
    ? [applicant.firstName, applicant.lastName]
    : typeof entry.candidateId === "string"
      ? ["?", "?"]
      : [entry.candidateId.firstName, entry.candidateId.lastName];

  const tier = scoreTier(entry.matchScore);
  const accent =
    tier === "strong"
      ? "bg-[var(--success)]"
      : tier === "partial"
        ? "bg-[var(--warning)]"
        : "bg-[var(--danger)]";
  const rankTone =
    entry.rank === 1
      ? "bg-[var(--warning)] text-slate-900"
      : entry.rank === 2
        ? "bg-[#9CA3AF] text-slate-900"
        : entry.rank === 3
          ? "bg-[#CD7F32] text-slate-900"
          : "bg-[var(--surface-muted)] text-muted";

  return (
    <article className="relative overflow-hidden rounded-[12px] border border-app bg-surface">
      <div className={`absolute inset-y-0 left-0 w-1 ${accent}`} />
      <div className="p-5 pl-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 gap-3">
            <div className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold", rankTone)}>
              {entry.rank}
            </div>
            <Avatar firstName={initialsSource[0]} lastName={initialsSource[1]} size={36} />
            <div className="min-w-0">
              <div className="truncate text-[15px] font-semibold text-primary">{name}</div>
              <div className="truncate text-xs text-muted">{headline}</div>
              <div className="mt-2 inline-flex rounded-full border border-app px-2.5 py-1 text-xs text-muted">
                {location}
              </div>
            </div>
          </div>

          <div className="text-left lg:text-right">
            <div className="text-[28px] font-bold leading-none text-primary">
              {entry.matchScore}
              <span className="ml-1 text-sm font-medium text-muted">/100</span>
            </div>
            <div
              className={
                tier === "strong"
                  ? "mt-1 text-xs font-medium text-[var(--success)]"
                  : tier === "partial"
                    ? "mt-1 text-xs font-medium text-[var(--warning)]"
                    : "mt-1 text-xs font-medium text-[var(--danger)]"
              }
            >
              {scoreLabel(entry.matchScore)}
            </div>
            <StarRating score={entry.matchScore} className="mt-2 lg:justify-end" />
          </div>
        </div>

        <div className="mt-4">
          <ScoreBar score={entry.matchScore} />
        </div>

        <div className="mt-4">
          <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
            Score breakdown
          </div>
          <SubScoreGrid subScores={entry.subScores} />
        </div>

        <div className="mt-4">
          <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
            Skill match
          </div>
          <div className="flex flex-wrap gap-2">
            {entry.skillMatchBreakdown.matched.map((skill) => (
              <Badge key={skill} tone="success">
                {skill}
              </Badge>
            ))}
            {entry.skillMatchBreakdown.missing.map((skill) => (
              <Badge key={skill} tone="danger">
                x {skill}
              </Badge>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <ListBlock title="Strengths" tone="success" items={entry.strengths.slice(0, 3)} />
          <ListBlock title="Gaps" tone="warning" items={entry.gaps.slice(0, 3)} />
        </div>

        <div className="mt-5 rounded-[8px] border border-[var(--accent)]/30 bg-[var(--accent-soft)] px-3 py-3 text-[13px] italic text-[var(--accent)]">
          {entry.recommendation}
        </div>

        <div
          className="why-expand"
          style={{
            maxHeight: showWhy ? 220 : 0,
            opacity: showWhy ? 1 : 0,
            marginTop: showWhy ? 16 : 0,
          }}
        >
          <div className="rounded-[12px] border border-app bg-[var(--surface-soft)] p-4">
            <div className="space-y-2">
              {entry.skillMatchBreakdown.matched.map((skill) => (
                <div key={skill} className="flex items-center gap-2 text-sm text-primary">
                  <CheckCircle2 size={15} className="text-[var(--success)]" />
                  {skill}
                </div>
              ))}
              {entry.skillMatchBreakdown.missing.map((skill) => (
                <div key={skill} className="flex items-center gap-2 text-sm text-primary">
                  <XCircle size={15} className="text-[var(--danger)]" />
                  {skill}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className="why-expand"
          style={{
            maxHeight: showProfile ? 420 : 0,
            opacity: showProfile ? 1 : 0,
            marginTop: showProfile ? 16 : 0,
          }}
        >
          <div className="grid gap-4 rounded-[12px] border border-app bg-[var(--surface-soft)] p-4">
            <ProfileSection
              icon={Briefcase}
              title="Projects"
              items={applicant?.projects?.slice(0, 3).map((project) => project.name) ?? []}
            />
            <ProfileSection
              icon={GraduationCap}
              title="Education"
              items={applicant?.education?.slice(0, 3).map((education) => education.degree) ?? []}
            />
            <ProfileSection
              icon={Medal}
              title="Certifications"
              items={applicant?.certifications?.slice(0, 3).map((certification) => certification.name) ?? []}
            />
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
                <Globe size={14} className="text-muted" />
                Social links
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-muted">
                {applicant?.socialLinks?.linkedin && (
                  <a
                    href={applicant.socialLinks.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 hover:text-[var(--accent)]"
                  >
                    <Linkedin size={14} />
                    LinkedIn
                  </a>
                )}
                {applicant?.socialLinks?.portfolio && (
                  <a
                    href={applicant.socialLinks.portfolio}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 hover:text-[var(--accent)]"
                  >
                    <Globe size={14} />
                    Portfolio
                  </a>
                )}
                {applicant?.email && (
                  <a
                    href={`mailto:${applicant.email}`}
                    className="inline-flex items-center gap-1 hover:text-[var(--accent)]"
                  >
                    <ExternalLink size={14} />
                    Email
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setShowProfile((value) => !value)}
            className="inline-flex items-center gap-1 text-sm text-[var(--accent)]"
          >
            View full profile
          </button>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => copyCandidateSummary(entry, applicant)}
              className="inline-flex items-center gap-1 text-sm text-muted hover:text-[var(--accent)]"
              aria-label="Copy candidate summary"
            >
              <Copy size={14} />
              Copy summary
            </button>
            <button
              type="button"
              onClick={() => setShowWhy((value) => !value)}
              className="inline-flex items-center gap-1 text-sm text-[var(--accent)]"
            >
              Why this score?
              <ChevronDown size={14} className={showWhy ? "rotate-180 transition" : "transition"} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function MetricCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "success" | "accent";
}) {
  const toneClass =
    tone === "success"
      ? "text-[var(--success)]"
      : tone === "accent"
        ? "text-[var(--accent)]"
        : "text-primary";

  return (
    <div className="rounded-[12px] bg-[var(--surface-muted)] p-4">
      <div className="text-[11px] uppercase tracking-[0.18em] text-muted">{label}</div>
      <div className={`mt-2 text-[24px] font-semibold ${toneClass}`}>{value}</div>
    </div>
  );
}

function ListBlock({
  title,
  tone,
  items,
}: {
  title: string;
  tone: "success" | "warning";
  items: string[];
}) {
  const dotClass = tone === "success" ? "bg-[var(--success)]" : "bg-[var(--warning)]";
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-xs font-medium text-primary">
        <span className={`h-2 w-2 rounded-full ${dotClass}`} />
        {title}
      </div>
      <div className="space-y-1.5 text-sm text-muted">
        {items.length === 0 ? <div>No major signals flagged.</div> : items.map((item, index) => <div key={index}>• {item}</div>)}
      </div>
    </div>
  );
}

function ProfileSection({
  icon: Icon,
  title,
  items,
}: {
  icon: typeof Briefcase;
  title: string;
  items: string[];
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
        <Icon size={14} className="text-muted" />
        {title}
      </div>
      <div className="space-y-1 text-sm text-muted">
        {items.length === 0 ? <div>Not provided.</div> : items.map((item) => <div key={item}>{item}</div>)}
      </div>
    </div>
  );
}

function resolveApplicant(entry: ScreeningCandidateResult, applicants: Applicant[]) {
  if (typeof entry.candidateId !== "string") {
    const candidateRef = entry.candidateId;
    const byId = applicants.find((candidate) => candidate._id === candidateRef._id);
    if (byId) return byId;
  }
  return applicants.find((candidate) => candidate.externalId === entry.externalId) ?? null;
}

function candidateName(entry: ScreeningCandidateResult, applicants: Applicant[]) {
  const applicant = resolveApplicant(entry, applicants);
  if (applicant) return fullName(applicant.firstName, applicant.lastName);
  if (typeof entry.candidateId === "string") return "Candidate";
  return fullName(entry.candidateId.firstName, entry.candidateId.lastName);
}

function ViewToggleButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof LayoutGrid;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={`${label} view`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[999px] px-3 py-1.5 text-xs font-medium transition",
        active ? "bg-[var(--accent)] text-white" : "text-muted hover:text-primary"
      )}
    >
      <Icon size={13} />
      {label}
    </button>
  );
}

function SubScoreGrid({ subScores }: { subScores: ScreeningCandidateResult["subScores"] }) {
  if (!subScores) return null;
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-2 md:grid-cols-4">
      {SUB_SCORE_FIELDS.map((field) => {
        const value = subScores[field.key] ?? 0;
        return (
          <div key={field.key}>
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] font-medium text-muted">
                {field.label}{" "}
                <span className="text-[10px] text-muted/70">{WEIGHTS[field.key]}%</span>
              </span>
              <span className="text-xs font-semibold text-primary">{value}</span>
            </div>
            <div className="mt-1">
              <ScoreBar score={value} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function copyCandidateSummary(entry: ScreeningCandidateResult, applicant: Applicant | null) {
  const name = applicant
    ? fullName(applicant.firstName, applicant.lastName)
    : typeof entry.candidateId !== "string"
      ? fullName(entry.candidateId.firstName, entry.candidateId.lastName)
      : "Candidate";
  const sub = entry.subScores;
  const lines = [
    `#${entry.rank} ${name} — ${entry.matchScore}/100 (${scoreLabel(entry.matchScore)})`,
    sub
      ? `Skills ${sub.skills} · Experience ${sub.experience} · Education ${sub.education} · Projects ${sub.projects}`
      : null,
    applicant?.email ? `Email: ${applicant.email}` : null,
    "",
    "Strengths:",
    ...entry.strengths.map((s) => `  - ${s}`),
    "",
    "Gaps:",
    ...entry.gaps.map((g) => `  - ${g}`),
    "",
    `Recommendation: ${entry.recommendation}`,
  ].filter(Boolean) as string[];
  const text = lines.join("\n");

  if (typeof navigator === "undefined" || !navigator.clipboard) {
    toast.error("Clipboard not available");
    return;
  }
  navigator.clipboard.writeText(text).then(
    () => toast.success("Summary copied"),
    () => toast.error("Failed to copy")
  );
}

function ResultsTable({
  entries,
  applicants,
}: {
  entries: ScreeningCandidateResult[];
  applicants: Applicant[];
}) {
  return (
    <div className="overflow-x-auto rounded-[12px] border border-app bg-surface pb-20">
      <table className="w-full min-w-[820px] text-sm">
        <thead>
          <tr className="border-b border-app text-left text-[11px] uppercase tracking-[0.18em] text-muted">
            <th className="px-4 py-3 font-medium">Rank</th>
            <th className="px-4 py-3 font-medium">Candidate</th>
            <th className="px-4 py-3 font-medium">Match</th>
            <th className="px-4 py-3 font-medium">Skills</th>
            <th className="px-4 py-3 font-medium">Exp</th>
            <th className="px-4 py-3 font-medium">Edu</th>
            <th className="px-4 py-3 font-medium">Projects</th>
            <th className="px-4 py-3 font-medium">Recommendation</th>
            <th className="px-4 py-3 font-medium" aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const applicant = resolveApplicant(entry, applicants);
            const name = candidateName(entry, applicants);
            const headline =
              applicant?.headline ??
              (typeof entry.candidateId !== "string" ? entry.candidateId.headline : "");
            const tier = scoreTier(entry.matchScore);
            const tierClass =
              tier === "strong"
                ? "text-[var(--success)]"
                : tier === "partial"
                  ? "text-[var(--warning)]"
                  : "text-[var(--danger)]";
            return (
              <tr key={entry.externalId} className="border-b border-app last:border-b-0 align-top">
                <td className="px-4 py-3 font-semibold text-primary">{entry.rank}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-primary">{name}</div>
                  {headline && <div className="text-xs text-muted">{headline}</div>}
                </td>
                <td className="px-4 py-3">
                  <div className={cn("text-base font-semibold", tierClass)}>
                    {entry.matchScore}
                    <span className="ml-0.5 text-xs font-normal text-muted">/100</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-primary">{entry.subScores?.skills ?? "—"}</td>
                <td className="px-4 py-3 text-primary">{entry.subScores?.experience ?? "—"}</td>
                <td className="px-4 py-3 text-primary">{entry.subScores?.education ?? "—"}</td>
                <td className="px-4 py-3 text-primary">{entry.subScores?.projects ?? "—"}</td>
                <td className="px-4 py-3 text-muted">
                  <div className="line-clamp-2 max-w-[320px]">{entry.recommendation}</div>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => copyCandidateSummary(entry, applicant)}
                    className="inline-flex items-center gap-1 text-xs text-muted hover:text-[var(--accent)]"
                    aria-label="Copy candidate summary"
                  >
                    <Copy size={13} />
                    Copy
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
