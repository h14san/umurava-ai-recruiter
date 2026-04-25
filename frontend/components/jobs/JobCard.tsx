"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { deleteJob } from "@/store/slices/jobsSlice";
import type { Job } from "@/types";

function cardStatus(rawStatus: Job["status"]) {
  if (rawStatus === "closed") return { label: "Draft", tone: "neutral" as const };
  return { label: "Pending", tone: "warning" as const };
}

export function JobCard({ job }: { job: Job }) {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const applicantCount = useAppSelector((state) => state.applicants.byJobId[job._id]?.length ?? 0);
  const active = pathname === `/jobs/${job._id}`;
  const status = cardStatus(job.status);
  const visibleSkills = job.requiredSkills.slice(0, 3);
  const overflow = Math.max(0, job.requiredSkills.length - visibleSkills.length);

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const confirmed = window.confirm("Are you sure you want to delete this job? This action is irreversible.");
    if (!confirmed) return;
    dispatch(deleteJob(job._id));
  }

  return (
    <Link
      href={`/jobs/${job._id}`}
      className={cn(
        "app-card group block p-5 transition duration-150 hover:-translate-y-0.5 hover:border-[var(--accent)]",
        active && "border-[var(--accent)]"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold text-primary">{job.title}</h3>
        </div>
        <Badge tone={status.tone}>{status.label}</Badge>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
        <span className="inline-flex items-center gap-1 rounded-full border border-app px-2.5 py-1">
          <MapPin size={12} />
          {job.location}
        </span>
        <span className="text-[10px] text-muted">•</span>
        <span className="rounded-full border border-app px-2.5 py-1">{job.experienceLevel}</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {visibleSkills.map((skill) => (
          <Badge key={skill} tone="skill">
            {skill}
          </Badge>
        ))}
        {overflow > 0 && <Badge tone="neutral">+{overflow}</Badge>}
      </div>

      <div className="mt-5 flex items-center justify-between text-sm">
        <span className="text-muted">
          {applicantCount} candidate{applicantCount === 1 ? "" : "s"}
        </span>
        <button
          onClick={handleDelete}
          className="inline-flex items-center justify-center rounded-[8px] p-1.5 text-muted transition hover:bg-red-500/10 hover:text-red-500"
          aria-label="Delete job"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </Link>
  );
}