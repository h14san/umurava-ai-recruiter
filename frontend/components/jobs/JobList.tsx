import { JobCard } from "./JobCard";
import type { Job } from "@/types";

export function JobList({ jobs }: { jobs: Job[] }) {
  return (
    <div className="grid gap-3">
      {jobs.map((j) => (
        <JobCard key={j._id} job={j} />
      ))}
    </div>
  );
}
