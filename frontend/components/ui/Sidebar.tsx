"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, Users, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/jobs/new", label: "New Job", icon: Users },
  { href: "/jobs", label: "Screenings", icon: Sparkles, match: "/jobs" },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <nav className="hidden w-56 border-r border-slate-200 bg-white p-4 md:block">
      <ul className="space-y-1">
        {items.slice(0, 2).map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <li key={item.href + item.label}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                  active
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-700 hover:bg-slate-100"
                )}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
