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
import { fetchApplicants } from "@/store/slices/applicantsSlice";
import { fetchJobs } from "@/store/slices/jobsSlice";

export default function JobsPage() {
  const dispatch = useAppDispatch();
  const { list, status, error } = useAppSelector((state) => state.jobs);
  const applicantsByJob = useAppSelector((state) => state.applicants.byJobId);

  useEffect(() => {
    void dispatch(fetchJobs());
  }, [dispatch]);

  useEffect(() => {
    list.forEach((job) => {
      if (!applicantsByJob[job._id]) {
        void dispatch(fetchApplicants(job._id));
      }
    });
  }, [applicantsByJob, dispatch, list]);

  return (
    <div className="flex min-h-full flex-col px-4 py-5 md:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-[20px]">Jobs</h1>
          <p className="text-sm text-muted">Create roles and launch AI-led shortlisting.</p>
        </div>
        <Link href="/jobs/new">
          <Button>
            <Plus size={16} />
            New Job
          </Button>
        </Link>
      </div>

      {status === "loading" && list.length === 0 && (
        <div className="flex flex-1 items-center justify-center py-12">
          <LoadingSpinner size={28} />
        </div>
      )}

      <ErrorMessage message={error} />

      {status !== "loading" && list.length === 0 && !error && (
        <div className="flex flex-1 items-center justify-center">
          <EmptyState
            icon={Briefcase}
            title="No jobs yet"
            description="Create your first job to start screening candidates with AI."
            action={
              <Link href="/jobs/new">
                <Button>
                  <Plus size={16} />
                  New Job
                </Button>
              </Link>
            }
          />
        </div>
      )}

      {list.length > 0 && <JobList jobs={list} />}
    </div>
  );
}
