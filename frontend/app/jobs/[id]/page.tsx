"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Users,
  Upload,
  Sparkles,
  FileJson,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { DISCLAIMER, SHORTLIST_SIZES } from "@/constants";
import { fullName } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addApplicantsThunk,
  fetchApplicants,
} from "@/store/slices/applicantsSlice";
import { fetchJob } from "@/store/slices/jobsSlice";
import { reset, runScreening } from "@/store/slices/screeningSlice";
import type { ShortlistSize, UmuravaProfile } from "@/types";

const STEP_LABEL: Record<string, string> = {
  loading_job: "Loading job & candidates…",
  calling_gemini: "Calling Gemini for ranking…",
  parsing: "Parsing ranked shortlist…",
  saving: "Saving screening result…",
  done: "Done.",
};

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const jobId = params.id;
  const router = useRouter();
  const dispatch = useAppDispatch();

  const job = useAppSelector((s) => s.jobs.current);
  const jobsStatus = useAppSelector((s) => s.jobs.status);
  const jobsError = useAppSelector((s) => s.jobs.error);

  const applicants = useAppSelector((s) => s.applicants.byJobId[jobId] ?? []);
  const applicantsStatus = useAppSelector((s) => s.applicants.status);
  const addStatus = useAppSelector((s) => s.applicants.addStatus);
  const addError = useAppSelector((s) => s.applicants.addError);

  const screeningStatus = useAppSelector((s) => s.screening.status);
  const screeningStep = useAppSelector((s) => s.screening.step);
  const screeningError = useAppSelector((s) => s.screening.error);

  const [shortlistSize, setShortlistSize] = useState<ShortlistSize>(10);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [pasteValue, setPasteValue] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!jobId) return;
    dispatch(fetchJob(jobId));
    dispatch(fetchApplicants(jobId));
    dispatch(reset());
  }, [dispatch, jobId]);

  const canScreen = applicants.length > 0 && screeningStatus !== "running";

  const shownJob = job && job._id === jobId ? job : null;

  async function ingestProfiles(profiles: UmuravaProfile[]) {
    setParseError(null);
    const result = await dispatch(addApplicantsThunk({ jobId, profiles }));
    if (addApplicantsThunk.fulfilled.match(result)) {
      setUploadOpen(false);
      setPasteValue("");
    }
  }

  function parseAndSubmit(raw: string) {
    setParseError(null);
    try {
      const parsed = JSON.parse(raw);
      const profiles: UmuravaProfile[] = Array.isArray(parsed) ? parsed : [parsed];
      if (profiles.length === 0) {
        setParseError("No profiles found in JSON.");
        return;
      }
      void ingestProfiles(profiles);
    } catch (err) {
      setParseError(
        err instanceof Error ? `Invalid JSON: ${err.message}` : "Invalid JSON."
      );
    }
  }

  async function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      const texts = await Promise.all(Array.from(files).map((f) => f.text()));
      const profiles: UmuravaProfile[] = [];
      for (const t of texts) {
        const parsed = JSON.parse(t);
        if (Array.isArray(parsed)) profiles.push(...parsed);
        else profiles.push(parsed);
      }
      void ingestProfiles(profiles);
    } catch (err) {
      setParseError(
        err instanceof Error ? `Invalid JSON in file: ${err.message}` : "Invalid JSON file."
      );
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function onRunScreening() {
    const result = await dispatch(runScreening({ jobId, shortlistSize }));
    if (runScreening.fulfilled.match(result)) {
      router.push(`/jobs/${jobId}/results`);
    }
  }

  const screeningProgress = useMemo(() => {
    if (screeningStatus !== "running") return null;
    return STEP_LABEL[screeningStep] ?? "Working…";
  }, [screeningStatus, screeningStep]);

  if (jobsStatus === "loading" && !shownJob) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size={28} />
      </div>
    );
  }

  if (!shownJob) {
    return (
      <div className="mx-auto max-w-2xl">
        <Link
          href="/jobs"
          className="mb-4 inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={14} />
          Back to jobs
        </Link>
        <ErrorMessage message={jobsError ?? "Job not found."} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/jobs"
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft size={14} />
        Back to jobs
      </Link>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-slate-900">{shownJob.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1">
                <Briefcase size={14} />
                {shownJob.experienceLevel}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin size={14} />
                {shownJob.location}
              </span>
              <Badge tone={shownJob.status === "open" ? "success" : "neutral"}>
                {shownJob.status}
              </Badge>
            </div>
          </div>
          <Link href={`/jobs/${jobId}/results`}>
            <Button variant="secondary">View results</Button>
          </Link>
        </div>

        <p className="mt-4 whitespace-pre-wrap text-sm text-slate-700">
          {shownJob.description}
        </p>

        {shownJob.requiredSkills.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1">
            {shownJob.requiredSkills.map((s) => (
              <Badge key={s} tone="info">
                {s}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Candidates</h2>
            <p className="text-xs text-slate-500">
              {applicants.length} profile{applicants.length === 1 ? "" : "s"} added
            </p>
          </div>
          <Button variant="secondary" onClick={() => setUploadOpen(true)}>
            <Upload size={16} />
            Add candidates
          </Button>
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
            description="Paste Umurava profile JSON or upload profile files to begin screening."
            action={
              <Button onClick={() => setUploadOpen(true)}>
                <Upload size={16} />
                Add candidates
              </Button>
            }
          />
        )}

        {applicants.length > 0 && (
          <ul className="divide-y divide-slate-100">
            {applicants.map((a) => (
              <li key={a._id} className="flex items-center gap-3 py-3">
                <Avatar firstName={a.firstName} lastName={a.lastName} size={36} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-slate-900">
                    {fullName(a.firstName, a.lastName)}
                  </div>
                  <div className="truncate text-xs text-slate-500">{a.headline}</div>
                </div>
                <div className="hidden shrink-0 text-xs text-slate-500 sm:block">
                  {a.location}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate-900">Run AI screening</h2>
        <p className="mb-4 text-xs text-slate-500">{DISCLAIMER}</p>

        <div className="flex flex-wrap items-end gap-3">
          <Select
            label="Shortlist size"
            value={shortlistSize}
            onChange={(e) =>
              setShortlistSize(Number(e.target.value) as ShortlistSize)
            }
            className="w-40"
            disabled={screeningStatus === "running"}
          >
            {SHORTLIST_SIZES.map((n) => (
              <option key={n} value={n}>
                Top {n}
              </option>
            ))}
          </Select>

          <Button onClick={onRunScreening} disabled={!canScreen} size="lg">
            {screeningStatus === "running" ? (
              <>
                <LoadingSpinner size={16} className="text-white" />
                {screeningProgress}
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Run screening
              </>
            )}
          </Button>
        </div>

        {applicants.length === 0 && (
          <p className="mt-3 text-xs text-amber-700">
            Add at least one candidate before running.
          </p>
        )}

        <ErrorMessage message={screeningError} />
      </section>

      <Modal
        open={uploadOpen}
        onClose={() => {
          setUploadOpen(false);
          setParseError(null);
        }}
        title="Add candidates"
      >
        <div className="space-y-4">
          <div>
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-md border border-dashed border-slate-300 bg-slate-50 py-6 text-center text-sm text-slate-600 hover:border-brand-400 hover:bg-brand-50">
              <FileJson size={24} />
              <span className="font-medium">Upload JSON file(s)</span>
              <span className="text-xs text-slate-500">
                One profile per file or an array of profiles
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                multiple
                className="hidden"
                onChange={onFileChange}
              />
            </label>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-slate-500">or paste JSON</span>
            </div>
          </div>

          <Textarea
            rows={6}
            value={pasteValue}
            onChange={(e) => setPasteValue(e.target.value)}
            placeholder='{ "firstName": "...", "lastName": "...", ... }  or  [ { ... }, { ... } ]'
          />

          <ErrorMessage message={parseError ?? addError} />

          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setUploadOpen(false)}
              disabled={addStatus === "loading"}
            >
              Cancel
            </Button>
            <Button
              onClick={() => parseAndSubmit(pasteValue)}
              disabled={!pasteValue.trim() || addStatus === "loading"}
            >
              {addStatus === "loading" && (
                <LoadingSpinner size={14} className="text-white" />
              )}
              Add
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
