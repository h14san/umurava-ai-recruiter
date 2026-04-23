"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Briefcase,
  ChevronDown,
  FileJson,
  Loader2,
  MapPin,
  Plus,
  Sparkles,
  Upload,
  Users,
  X,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Textarea } from "@/components/ui/Textarea";
import { DISCLAIMER } from "@/constants";
import { fullName } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addApplicantsThunk, fetchApplicants } from "@/store/slices/applicantsSlice";
import { fetchJob } from "@/store/slices/jobsSlice";
import { fetchResults, runScreening } from "@/store/slices/screeningSlice";
import type { ShortlistSize, UmuravaProfile } from "@/types";

type PanelMode = "details" | "candidates";

function availabilityTone(status: string | undefined) {
  if (status === "Available") return "bg-[var(--success)]";
  if (status === "Open to Opportunities") return "bg-[var(--warning)]";
  return "bg-[var(--text-secondary)]";
}

function formatExperience(level?: string) {
  if (level === "Mid") return "Mid-level";
  return level ?? "Not set";
}

function statusMeta(hasResults: boolean, rawStatus?: string) {
  if (hasResults) return { label: "Screened", tone: "success" as const };
  if (rawStatus === "closed") return { label: "Draft", tone: "neutral" as const };
  return { label: "Pending", tone: "warning" as const };
}

export function JobRightPanel() {
  const params = useParams<{ id?: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const jobId = params?.id ?? null;
  const isResultsPage = pathname.endsWith("/results");

  const [panelMode, setPanelMode] = useState<PanelMode>("details");
  const [shortlistSize, setShortlistSize] = useState<ShortlistSize>(10);
  const [pasteValue, setPasteValue] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [showSchema, setShowSchema] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [candidateTab, setCandidateTab] = useState<"paste" | "demo">("paste");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const job = useAppSelector((state) =>
    state.jobs.current && state.jobs.current._id === jobId ? state.jobs.current : null
  );
  const applicants = useAppSelector((state) =>
    jobId ? state.applicants.byJobId[jobId] ?? [] : []
  );
  const addStatus = useAppSelector((state) => state.applicants.addStatus);
  const addError = useAppSelector((state) => state.applicants.addError);
  const screeningStatus = useAppSelector((state) => state.screening.status);
  const screeningError = useAppSelector((state) => state.screening.error);
  const results = useAppSelector((state) =>
    jobId ? state.screening.resultsByJobId[jobId] ?? null : null
  );

  useEffect(() => {
    if (!jobId) return;
    void dispatch(fetchJob(jobId));
    void dispatch(fetchApplicants(jobId));
    void dispatch(fetchResults(jobId));
  }, [dispatch, jobId]);

  useEffect(() => {
    setPanelMode("details");
    setPasteValue("");
    setParseError(null);
    setShowSchema(false);
    setDescriptionExpanded(false);
  }, [pathname]);

  const status = statusMeta(Boolean(results), job?.status);

  const resultPreview = useMemo(() => {
    if (!results) return null;
    const top = results.results[0];
    return {
      total: results.results.length,
      topScore: top?.matchScore ?? 0,
      generatedAt: new Date(results.createdAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
    };
  }, [results]);

  async function ingestProfiles(profiles: UmuravaProfile[]) {
    if (!jobId) return;
    setParseError(null);
    const loadingToast = toast.loading(
      `Uploading ${profiles.length} profile${profiles.length === 1 ? "" : "s"}...`
    );
    const result = await dispatch(addApplicantsThunk({ jobId, profiles }));
    toast.dismiss(loadingToast);

    if (addApplicantsThunk.fulfilled.match(result)) {
      toast.success(`${profiles.length} candidate profile${profiles.length === 1 ? "" : "s"} added.`);
      setPasteValue("");
      setPanelMode("details");
      return;
    }

    toast.error(result.payload ?? "Could not add candidate profiles.");
  }

  function parseAndSubmit(raw: string) {
    setParseError(null);
    try {
      const parsed = JSON.parse(raw);
      const profiles = (Array.isArray(parsed) ? parsed : [parsed]) as UmuravaProfile[];
      if (profiles.length === 0) {
        setParseError("No profiles found in JSON.");
        return;
      }
      void ingestProfiles(profiles);
    } catch (error) {
      setParseError(error instanceof Error ? `Invalid JSON: ${error.message}` : "Invalid JSON.");
    }
  }

  async function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files?.length) return;

    try {
      const contents = await Promise.all(Array.from(files).map((file) => file.text()));
      const profiles: UmuravaProfile[] = [];
      for (const content of contents) {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) profiles.push(...(parsed as UmuravaProfile[]));
        else profiles.push(parsed as UmuravaProfile);
      }
      void ingestProfiles(profiles);
    } catch (error) {
      setParseError(
        error instanceof Error ? `Invalid JSON in file: ${error.message}` : "Invalid JSON file."
      );
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function loadDemoProfiles() {
    try {
      const infoToast = toast.loading("Loading demo candidates...");
      const response = await fetch("/dummy-profiles.json");
      if (!response.ok) throw new Error("Could not load demo data.");
      const profiles = (await response.json()) as UmuravaProfile[];
      toast.dismiss(infoToast);
      void ingestProfiles(profiles);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load demo data.");
    }
  }

  async function runAiScreening() {
    if (!jobId) return;
    const result = await dispatch(runScreening({ jobId, shortlistSize }));
    if (runScreening.fulfilled.match(result)) {
      toast.success("Screening complete.");
      router.push(`/jobs/${jobId}/results`);
      return;
    }
    toast.error(result.payload ?? "Screening failed.");
  }

  if (!jobId || !job) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted">
        Select a job to view details, add candidates, and run screening.
      </div>
    );
  }

  if (isResultsPage && resultPreview) {
    return (
      <div className="space-y-6 p-5">
        <section className="app-card space-y-4 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted">Results Preview</p>
              <h2 className="mt-1 text-lg">{job.title}</h2>
            </div>
            <Badge tone="success">Screened</Badge>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Metric label="Applicants" value={String(resultPreview.total)} tone="neutral" />
            <Metric label="Top Score" value={`${resultPreview.topScore}`} tone="info" />
            <Metric label="Date" value={resultPreview.generatedAt} tone="neutral" />
          </div>
          <div className="rounded-[12px] border border-[var(--accent)]/30 bg-[var(--accent-soft)] px-3 py-3 text-sm text-[var(--accent)]">
            Ranked suggestions are available in the main area. Review reasoning and final-fit gaps before acting.
          </div>
          <Link href={`/jobs/${jobId}`}>
            <Button variant="outlined" full>
              Back to job
            </Button>
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-5">
      {panelMode === "details" ? (
        <>
          <section className="app-card space-y-4 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg">{job.title}</h2>
                <p className="mt-1 text-sm text-muted">AI job context and screening controls</p>
              </div>
              <Badge tone={status.tone}>{status.label}</Badge>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge tone="neutral">
                <MapPin size={12} className="mr-1" />
                {job.location}
              </Badge>
              <Badge tone="neutral">
                <Briefcase size={12} className="mr-1" />
                {formatExperience(job.experienceLevel)}
              </Badge>
              <Badge tone="neutral">Full-time</Badge>
            </div>

            {job.requiredSkills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.map((skill) => (
                  <Badge key={skill} tone="skill">
                    {skill}
                  </Badge>
                ))}
              </div>
            )}

            <div>
              <p className={descriptionExpanded ? "text-sm text-muted" : "line-clamp-4 text-sm text-muted"}>
                {job.description}
              </p>
              <button
                type="button"
                onClick={() => setDescriptionExpanded((value) => !value)}
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[var(--accent)]"
              >
                {descriptionExpanded ? "Hide description" : "Show full description"}
                <ChevronDown size={14} className={descriptionExpanded ? "rotate-180 transition" : "transition"} />
              </button>
            </div>
          </section>

          <section className="app-card space-y-4 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base">Candidates ({applicants.length})</h3>
                <p className="text-xs text-muted">Profiles attached to this job</p>
              </div>
              <Badge tone="neutral">{applicants.length}</Badge>
            </div>

            <div className="space-y-2">
              {applicants.slice(0, 6).map((candidate) => (
                <div
                  key={candidate._id}
                  className="flex items-center gap-3 rounded-[10px] border border-app bg-[var(--surface-soft)] px-3 py-2"
                >
                  <Avatar firstName={candidate.firstName} lastName={candidate.lastName} size={34} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-semibold text-primary">
                      {fullName(candidate.firstName, candidate.lastName)}
                    </div>
                    <div className="truncate text-[11px] text-muted">{candidate.headline}</div>
                  </div>
                  <span
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${availabilityTone(
                      candidate.availability?.status
                    )}`}
                  />
                </div>
              ))}

              {applicants.length === 0 && (
                <div className="rounded-[12px] border border-dashed border-app px-4 py-6 text-center text-sm text-muted">
                  No candidates added yet.
                </div>
              )}
            </div>

            <Button variant="outlined" full onClick={() => setPanelMode("candidates")}>
              <Plus size={16} />
              Add candidates
            </Button>
          </section>

          <section className="app-card space-y-4 border-[#1D9E75]/20 p-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#1D9E75]">
                Screening Action
              </p>
              <h3 className="mt-1 text-base">Run AI Screening</h3>
            </div>

            <div className="inline-flex rounded-[10px] border border-app bg-[var(--surface-soft)] p-1">
              {[10, 20].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setShortlistSize(size as ShortlistSize)}
                  className={
                    shortlistSize === size
                      ? "rounded-[8px] bg-white px-3 py-1.5 text-xs font-medium text-slate-900 dark:bg-white dark:text-slate-900"
                      : "rounded-[8px] px-3 py-1.5 text-xs font-medium text-muted"
                  }
                >
                  Top {size}
                </button>
              ))}
            </div>

            <Button
              variant="brand"
              full
              className="h-11"
              disabled={screeningStatus === "running" || applicants.length === 0}
              onClick={runAiScreening}
            >
              {screeningStatus === "running" ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Screening...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Run AI Screening
                </>
              )}
            </Button>

            <p className="text-[11px] italic text-muted">{DISCLAIMER}</p>
            <ErrorMessage message={screeningError} />
          </section>
        </>
      ) : (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg">Add candidates</h2>
              <p className="text-sm text-muted">Attach profiles to {job.title}</p>
            </div>
            <button
              type="button"
              onClick={() => setPanelMode("details")}
              className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] text-muted hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
              aria-label="Close add candidates panel"
            >
              <X size={16} />
            </button>
          </div>

          <div className="inline-flex rounded-[10px] border border-app bg-surface p-1">
            <button
              type="button"
              onClick={() => setCandidateTab("paste")}
              className={
                candidateTab === "paste"
                  ? "rounded-[8px] bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white"
                  : "rounded-[8px] px-3 py-1.5 text-xs font-medium text-muted"
              }
            >
              Paste JSON
            </button>
            <button
              type="button"
              onClick={() => setCandidateTab("demo")}
              className={
                candidateTab === "demo"
                  ? "rounded-[8px] bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white"
                  : "rounded-[8px] px-3 py-1.5 text-xs font-medium text-muted"
              }
            >
              Load demo data
            </button>
          </div>

          {candidateTab === "paste" ? (
            <div className="app-card space-y-4 p-4">
              <label className="block space-y-2">
                <span className="text-xs font-medium text-primary">Profiles JSON</span>
                <Textarea
                  rows={8}
                  value={pasteValue}
                  onChange={(event) => setPasteValue(event.target.value)}
                  placeholder="Paste an array of profiles following Umurava schema..."
                />
              </label>

              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-[12px] border border-dashed border-app px-4 py-3 text-sm text-muted transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]">
                <Upload size={16} />
                Upload JSON file(s)
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json,.json"
                  multiple
                  className="hidden"
                  onChange={onFileChange}
                />
              </label>

              <button
                type="button"
                onClick={() => setShowSchema((value) => !value)}
                className="inline-flex items-center gap-1 text-xs font-medium text-[var(--accent)]"
              >
                View expected format
                <ChevronDown size={14} className={showSchema ? "rotate-180 transition" : "transition"} />
              </button>

              <div
                className="why-expand"
                style={{
                  maxHeight: showSchema ? 220 : 0,
                  opacity: showSchema ? 1 : 0,
                  marginTop: showSchema ? 4 : 0,
                }}
              >
                <pre className="overflow-x-auto rounded-[12px] border border-app bg-[var(--surface-soft)] p-3 text-[11px] text-muted">
{`[
  {
    "firstName": "Ada",
    "lastName": "Okoro",
    "headline": "Senior Backend Engineer",
    "skills": [{ "name": "Node.js", "level": "Expert", "yearsOfExperience": 6 }],
    "availability": { "status": "Available", "type": "Full-time", "startDate": "2026-05-01" }
  }
]`}
                </pre>
              </div>

              <ErrorMessage message={parseError ?? addError} />

              <Button
                full
                disabled={!pasteValue.trim() || addStatus === "loading"}
                onClick={() => parseAndSubmit(pasteValue)}
              >
                {addStatus === "loading" ? <Loader2 size={16} className="animate-spin" /> : <FileJson size={16} />}
                Submit profiles
              </Button>
            </div>
          ) : (
            <div className="app-card space-y-4 p-4">
              <div>
                <h3 className="text-base">Demo dataset</h3>
                <p className="text-sm text-muted">
                  Load 20 pre-built profiles for a Senior Backend Engineer role.
                </p>
              </div>

              <div className="space-y-2 rounded-[12px] border border-app bg-[var(--surface-soft)] p-3">
                {[
                  ["Naomi Habineza", "Strong"],
                  ["David Mugisha", "Partial"],
                  ["Aline Uwase", "Strong"],
                ].map(([name, tier]) => (
                  <div key={name} className="flex items-center justify-between text-sm">
                    <span>{name}</span>
                    <Badge tone={tier === "Strong" ? "success" : "warning"}>{tier}</Badge>
                  </div>
                ))}
              </div>

              <Button
                variant="success"
                full
                className="h-11"
                disabled={addStatus === "loading"}
                onClick={loadDemoProfiles}
              >
                {addStatus === "loading" ? <Loader2 size={16} className="animate-spin" /> : <Users size={16} />}
                Load 20 demo profiles
              </Button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "neutral" | "info";
}) {
  return (
    <div className="min-w-0 overflow-hidden rounded-[12px] border border-app bg-[var(--surface-soft)] p-3">
      <div className="truncate text-[10px] font-medium uppercase tracking-[0.08em] text-muted">
        {label}
      </div>
      <div
        className={
          tone === "info"
            ? "mt-1.5 truncate text-[15px] font-semibold tabular-nums text-[var(--accent)]"
            : "mt-1.5 truncate text-[15px] font-semibold tabular-nums"
        }
        title={value}
      >
        {value}
      </div>
    </div>
  );
}
