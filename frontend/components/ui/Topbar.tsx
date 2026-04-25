"use client";

import { useEffect, useState } from "react";
import { Bell, Menu, Search, UserCircle } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAppSelector } from "@/store/hooks";
import { initials } from "@/lib/utils";

interface Props {
  onToggleSidebar?: () => void;
}

export function Topbar({ onToggleSidebar }: Props) {
  const user = useAppSelector((s) => s.auth.user);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fallback = "RC";
  const userInitials =
    mounted && user
      ? initials(user.name.split(" ")[0] ?? "R", user.name.split(" ")[1] ?? "C")
      : fallback;

  return (
    <header className="flex h-[52px] shrink-0 items-center justify-between gap-4 border-b border-app bg-surface px-4">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="rounded-[8px] p-1.5 text-muted transition hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
        )}
        <span className="text-[20px] font-bold tracking-tight text-[#1D9E75]">
          Candidate Ranking System<span className="text-[#1D9E75]">.</span>
        </span>
      </div>

      <div className="hidden flex-1 justify-center md:flex">
        <div className="relative w-full max-w-md">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            placeholder="Search jobs, candidates..."
            className="app-input pill-input h-10 border-app bg-[var(--background)] pl-9 pr-4 text-xs"
          />
        </div>
      </div>

      {/* <div className="flex items-center gap-1.5">
        <ThemeToggle />
        <button
          className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] text-muted transition hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>
        <div
          className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-semibold text-white"
          title={mounted ? user?.name : undefined}
        >
          {userInitials}
        </div>
      </div> */}
      <div className="flex items-center gap-1.5">
        <ThemeToggle />
        <button
          className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] text-muted transition hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>
        <button
          className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] text-muted transition hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
          aria-label="Profile"
        >
          <UserCircle size={18} />
        </button>
      </div>
    </header>
  );
}
