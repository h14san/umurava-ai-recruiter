"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
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
  const { createStatus, createError } = useAppSelector((state) => state.jobs);
  const saving = createStatus === "loading";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillDraft, setSkillDraft] = useState("");
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>("Mid");
  const [location, setLocation] = useState("");
  const [employmentType, setEmploymentType] = useState("Full-time");
  const [formError, setFormError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  function addSkill(raw: string) {
    const value = raw.trim();
    if (!value || skills.includes(value)) return;
    setSkills([...skills, value]);
    setSkillDraft("");
  }

  function onSkillKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addSkill(skillDraft);
    } else if (event.key === "Backspace" && !skillDraft && skills.length > 0) {
      setSkills(skills.slice(0, -1));
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setTouched(true);
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

  const titleError = touched && !title.trim() ? "Job title is required." : undefined;
  const locationError = touched && !location.trim() ? "Location is required." : undefined;
  const descriptionError =
    touched && description.trim().length < 10 ? "Description must be at least 10 characters." : undefined;

  return (
    <div className="flex min-h-full justify-center px-4 py-6 md:px-6">
      <div className="w-full max-w-[600px]">
        <div className="app-panel p-6">
          <div className="mb-6">
            <h1 className="text-[20px]">Create a job</h1>
            <p className="mt-2 text-sm text-muted">
              Keep the same backend flow, but give recruiters a clearer brief to screen against.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              label="Job title"
              name="title"
              required
              minLength={2}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Senior Frontend Engineer"
              disabled={saving}
              error={titleError}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Experience level"
                name="experienceLevel"
                value={experienceLevel}
                onChange={(event) => setExperienceLevel(event.target.value as ExperienceLevel)}
                disabled={saving}
              >
                {EXPERIENCE_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level === "Mid" ? "Mid-level" : level}
                  </option>
                ))}
              </Select>

              <Select
                label="Employment type"
                value={employmentType}
                onChange={(event) => setEmploymentType(event.target.value)}
                disabled={saving}
              >
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
              </Select>
            </div>

            <Input
              label="Location"
              name="location"
              required
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="e.g. Kigali / Remote"
              disabled={saving}
              error={locationError}
            />

            <Textarea
              label="Job description"
              name="description"
              required
              rows={5}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe the role, must-have skills, and signals the AI should weigh heavily."
              disabled={saving}
              error={descriptionError}
            />

            <div>
              <span className="mb-1.5 block text-xs font-medium text-primary">Required skills</span>
              <div className="rounded-[12px] border border-app bg-[var(--input-bg)] px-3 py-3">
                <div className="mb-2 flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge key={skill} tone="skill" className="gap-1">
                      {skill}
                      <button
                        type="button"
                        onClick={() => setSkills(skills.filter((item) => item !== skill))}
                        className="rounded-full"
                        aria-label={`Remove ${skill}`}
                      >
                        <X size={12} />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    value={skillDraft}
                    onChange={(event) => setSkillDraft(event.target.value)}
                    onKeyDown={onSkillKeyDown}
                    placeholder="Type skill + Enter"
                    className="min-w-0 flex-1 bg-transparent text-sm text-primary outline-none placeholder:text-[var(--text-secondary)]"
                    disabled={saving}
                  />
                  {skillDraft.trim() && (
                    <button
                      type="button"
                      onClick={() => addSkill(skillDraft)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] bg-[var(--accent-soft)] text-[var(--accent)]"
                    >
                      <Plus size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <ErrorMessage message={formError ?? createError} />

            <div className="flex items-center justify-end gap-2 pt-2">
              <Link href="/jobs">
                <Button type="button" variant="ghost" disabled={saving}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={saving}>
                {saving && <LoadingSpinner size={16} className="text-white" />}
                {saving ? "Saving..." : "Save job"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
