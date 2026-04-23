"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { JobRightPanel } from "@/components/jobs/JobRightPanel";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);

  const hasJobContext =
    pathname.startsWith("/jobs/") && !pathname.startsWith("/jobs/new");

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    setRightPanelCollapsed(!hasJobContext);
  }, [hasJobContext]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-app text-primary">
      <Topbar onToggleSidebar={() => setMobileSidebarOpen(true)} />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        <main className="min-w-0 flex-1 overflow-y-auto border-r border-app bg-app scrollbar-thin">
          <div className="page-fade min-h-full">{children}</div>
        </main>

        <aside
          className={cn(
            "relative hidden shrink-0 border-l border-app bg-panel transition-[width] duration-200 lg:block",
            hasJobContext && !rightPanelCollapsed ? "w-[360px]" : "w-0 overflow-hidden border-l-0"
          )}
        >
          {hasJobContext && !rightPanelCollapsed && (
            <div className="panel-slide flex h-full flex-col">
              <div className="flex h-[52px] items-center justify-between border-b border-app px-4">
                <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
                  Context
                </span>
                <button
                  type="button"
                  onClick={() => setRightPanelCollapsed(true)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] text-muted transition hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
                  aria-label="Collapse panel"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
                <JobRightPanel />
              </div>
            </div>
          )}
        </aside>

        {hasJobContext && rightPanelCollapsed && (
          <button
            type="button"
            onClick={() => setRightPanelCollapsed(false)}
            className="hidden h-full w-10 shrink-0 items-center justify-center border-l border-app bg-panel text-muted transition hover:text-[var(--accent)] lg:flex"
            aria-label="Open panel"
          >
            <ChevronRight size={18} className="rotate-180" />
          </button>
        )}
      </div>
    </div>
  );
}
