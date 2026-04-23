"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Briefcase, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { JobList } from "@/components/jobs/JobList";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchJobs } from "@/store/slices/jobsSlice";

export default function JobsPage() {
  const dispatch = useAppDispatch();
  const { list, status, error } = useAppSelector((s) => s.jobs);

  useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch]);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Jobs</h1>
          <p className="text-sm text-slate-500">Create and screen job postings.</p>
        </div>
        <Link href="/jobs/new">
          <Button>
            <Plus size={16} />
            New Job
          </Button>
        </Link>
      </div>

      {status === "loading" && list.length === 0 && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size={28} />
        </div>
      )}

      <ErrorMessage message={error} />

      {status !== "loading" && list.length === 0 && !error && (
        <EmptyState
          icon={Briefcase}
          title="No jobs yet"
          description="Create your first job posting to begin screening Umurava talent."
          action={
            <Link href="/jobs/new">
              <Button>
                <Plus size={16} />
                Create job
              </Button>
            </Link>
          }
        />
      )}

      {list.length > 0 && <JobList jobs={list} />}
    </div>
  );
}
