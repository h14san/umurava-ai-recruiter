"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, X, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EXPERIENCE_LEVELS } from "@/constants";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createJob } from "@/store/slices/jobsSlice";
import type { ExperienceLevel } from "@/types";

export default function NewJobPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { createStatus, createError } = useAppSelector((s) => s.jobs);
  const saving = createStatus === "loading";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillDraft, setSkillDraft] = useState("");
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>("Mid");
  const [location, setLocation] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  function addSkill(raw: string) {
    const v = raw.trim();
    if (!v) return;
    if (skills.includes(v)) return;
    setSkills([...skills, v]);
    setSkillDraft("");
  }

  function onSkillKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(skillDraft);
    } else if (e.key === "Backspace" && !skillDraft && skills.length > 0) {
      setSkills(skills.slice(0, -1));
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    const finalSkills = skillDraft.trim() ? [...skills, skillDraft.trim()] : skills;
    if (finalSkills.length === 0) {
      setFormError("Add at least one required skill.");
      return;
    }
    if (description.trim().length < 10) {
      setFormError("Description must be at least 10 characters.");
      return;
    }

    const result = await dispatch(
      createJob({
        title: title.trim(),
        description: description.trim(),
        requiredSkills: finalSkills,
        experienceLevel,
        location: location.trim(),
      })
    );
    if (createJob.fulfilled.match(result)) {
      router.replace(`/jobs/${result.payload._id}`);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/jobs"
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft size={14} />
        Back to jobs
      </Link>

      <h1 className="text-xl font-semibold text-slate-900">New job</h1>
      <p className="mb-6 text-sm text-slate-500">
        Describe the role. Gemini will use this to rank Umurava candidates.
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Title"
          name="title"
          required
          minLength={2}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Senior Frontend Engineer"
          disabled={saving}
        />

        <Textarea
          label="Description"
          name="description"
          required
          rows={6}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Responsibilities, must-haves, nice-to-haves…"
          disabled={saving}
        />

        <div>
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Required skills
          </span>
          <div className="flex flex-wrap items-center gap-2 rounded-md border border-slate-300 bg-white px-2 py-2">
            {skills.map((s) => (
              <Badge key={s} tone="info" className="gap-1">
                {s}
                <button
                  type="button"
                  onClick={() => setSkills(skills.filter((x) => x !== s))}
                  className="hover:text-red-600"
                  aria-label={`Remove ${s}`}
                >
                  <X size={12} />
                </button>
              </Badge>
            ))}
            <input
              value={skillDraft}
              onChange={(e) => setSkillDraft(e.target.value)}
              onKeyDown={onSkillKeyDown}
              placeholder={
                skills.length === 0 ? "Type a skill and press Enter" : "Add more…"
              }
              className="min-w-[140px] flex-1 bg-transparent px-1 py-0.5 text-sm outline-none"
              disabled={saving}
            />
            {skillDraft.trim() && (
              <button
                type="button"
                onClick={() => addSkill(skillDraft)}
                className="rounded p-1 text-brand-600 hover:bg-brand-50"
                aria-label="Add skill"
              >
                <Plus size={14} />
              </button>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Press Enter or comma to add. These are interpolated into the screening prompt.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Experience level"
            name="experienceLevel"
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
            disabled={saving}
          >
            {EXPERIENCE_LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </Select>

          <Input
            label="Location"
            name="location"
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Kigali / Remote"
            disabled={saving}
          />
        </div>

        <ErrorMessage message={formError ?? createError} />

        <div className="flex items-center justify-end gap-2 pt-2">
          <Link href="/jobs">
            <Button type="button" variant="secondary" disabled={saving}>
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={saving}>
            {saving && <LoadingSpinner size={16} className="text-white" />}
            {saving ? "Creating…" : "Create job"}
          </Button>
        </div>
      </form>
    </div>
  );
}
