"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Briefcase, LogOut, ScanSearch, Settings, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchJobs } from "@/store/slices/jobsSlice";
import { logout } from "@/store/slices/authSlice";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const navItems = [
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/screenings", label: "Screenings", icon: ScanSearch, disabled: true },
  { href: "/settings", label: "Settings", icon: Settings, disabled: true },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ mobileOpen = false, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const jobs = useAppSelector((s) => s.jobs.list);

  useEffect(() => {
    if (jobs.length === 0) {
      void dispatch(fetchJobs());
    }
  }, [dispatch, jobs.length]);

  const activeJobId = pathname.startsWith("/jobs/") ? pathname.split("/")[2] : null;

  function handleLogout() {
    dispatch(logout());
    router.replace("/login");
  }

  const content = (
    <div className="flex h-full flex-col bg-surface">
      <div className="flex h-[52px] items-center justify-between border-b border-app px-4 lg:hidden">
        <span className="text-[22px] font-semibold tracking-[-0.03em] text-[#1D9E75]">
          Candidate Ranking System
        </span>
        <button
          type="button"
          onClick={onCloseMobile}
          className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] text-muted hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
          aria-label="Close navigation"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden px-3 py-4">
        <div className="mb-5 hidden px-2 lg:block">
          <span className="text-[24px] font-semibold tracking-[-0.03em] text-[#1D9E75]">
          </span>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/jobs"
                ? pathname === "/jobs" || pathname.startsWith("/jobs/")
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.disabled ? pathname : item.href}
                onClick={(event) => {
                  if (item.disabled) {
                    event.preventDefault();
                    return;
                  }
                  onCloseMobile?.();
                }}
                className={cn(
                  "flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "text-muted hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]",
                  item.disabled && "cursor-not-allowed opacity-50"
                )}
                aria-disabled={item.disabled}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 min-h-0 flex-1 overflow-y-auto scrollbar-thin border-t border-app pt-4">
          <div className="mb-3 px-3 text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
            Positions
          </div>

          {jobs.length === 0 ? (
            <div className="px-3 text-xs text-muted">No jobs created yet.</div>
          ) : (
            <div className="space-y-1">
              {jobs.map((job) => {
                const active = activeJobId === job._id;
                return (
                  <Link
                    key={job._id}
                    href={`/jobs/${job._id}`}
                    onClick={() => onCloseMobile?.()}
                    className={cn(
                      "block rounded-[10px] border px-3 py-2 transition-all",
                      active
                        ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                        : "border-transparent text-muted hover:border-app hover:bg-[var(--surface-soft)] hover:text-primary"
                    )}
                  >
                    <div className="truncate text-sm font-medium">{job.title}</div>
                    <div className="truncate text-[11px] text-muted">
                      {job.location} · {job.experienceLevel}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-app px-3 py-3">
        <button
          type="button"
          onClick={handleLogout}
          className="mb-2 flex w-full items-center gap-2 rounded-[10px] px-3 py-2 text-xs text-muted transition hover:bg-[var(--surface-soft)] hover:text-primary"
        >
          <LogOut size={14} />
          Sign out
        </button>
        <div className="flex items-center justify-between px-2">
          <span className="text-[11px] text-muted">by Team. N</span>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden h-full w-[220px] shrink-0 border-r border-app lg:block">
        {content}
      </aside>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden",
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onCloseMobile}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[220px] border-r border-app transition-transform duration-200 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {content}
      </aside>
    </>
  );
}
