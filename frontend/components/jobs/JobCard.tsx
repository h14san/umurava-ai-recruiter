import Link from "next/link";
import { MapPin, Briefcase, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { Job } from "@/types";

export function JobCard({ job }: { job: Job }) {
  return (
    <Link
      href={`/jobs/${job._id}`}
      className="group flex items-start justify-between rounded-lg border border-slate-200 bg-white p-5 transition hover:border-brand-400 hover:shadow-sm"
    >
      <div className="min-w-0">
        <h3 className="truncate text-base font-semibold text-slate-900">{job.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-slate-600">{job.description}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Briefcase size={12} />
            {job.experienceLevel}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin size={12} />
            {job.location}
          </span>
          <Badge tone={job.status === "open" ? "success" : "neutral"}>{job.status}</Badge>
        </div>
        {job.requiredSkills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {job.requiredSkills.slice(0, 6).map((s) => (
              <Badge key={s} tone="info">
                {s}
              </Badge>
            ))}
          </div>
        )}
      </div>
      <ChevronRight className="ml-4 shrink-0 text-slate-300 transition group-hover:text-brand-500" />
    </Link>
  );
}
