"use client";
import Link from "next/link";
import { LogOut, Sparkles } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { Button } from "./Button";

export function Topbar() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
      <Link href="/jobs" className="flex items-center gap-2 text-slate-900">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-600 text-white">
          <Sparkles size={18} />
        </span>
        <span className="font-semibold">Umurava AI Recruiter</span>
      </Link>

      {user && (
        <div className="flex items-center gap-3">
          <div className="text-right text-sm">
            <div className="font-medium text-slate-900">{user.name}</div>
            <div className="text-xs text-slate-500">{user.email}</div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => dispatch(logout())}>
            <LogOut size={16} />
            Logout
          </Button>
        </div>
      )}
    </header>
  );
}
