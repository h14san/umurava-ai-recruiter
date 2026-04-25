"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { login } from "@/store/slices/authSlice";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { status, error, token } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (token) router.replace("/jobs");
  }, [token, router]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const result = await dispatch(login({ email, password }));
    if (login.fulfilled.match(result)) {
      router.replace("/jobs");
    }
  }

  const loading = status === "loading";

  return (
    <div className="min-h-screen bg-app">
      <div className="grid min-h-screen lg:grid-cols-[45fr_55fr]">
        <section className="hidden bg-[#04342C] px-10 py-12 lg:flex lg:items-center lg:justify-center">
          <div className="max-w-sm">
            <div className="text-[38px] font-semibold tracking-[-0.04em] text-[#1D9E75]">
              Candidate Ranking System.
            </div>
            <h1 className="mt-8 text-[22px] font-semibold leading-[1.3] text-white">
              AI-powered screening.
              <br />
              Optimized for recruiter decision-making
            </h1>
            <div className="mt-8 space-y-4">
              {[
                "Screen 20+ candidates in seconds",
                "Explainable AI rankings",
                "Human-Led Decisions",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm text-white/80">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#10B981]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-10 md:px-8">
          <div className="app-panel w-full max-w-md border-none bg-surface p-8 dark:border dark:border-app dark:bg-surface">
            <div className="mb-8">
              <div className="mb-6 text-[28px] font-semibold tracking-[-0.04em] text-[#1D9E75] lg:hidden">
                competence.
              </div>
              <h2 className="text-[24px]">Welcome back</h2>
              <p className="mt-2 text-sm text-muted">Sign in to your recruiter account</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                name="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={loading}
              />
              <Input
                label="Password"
                type="password"
                name="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={loading}
              />

              <ErrorMessage message={error} />

              <Button type="submit" size="lg" full className="h-11" disabled={loading}>
                {loading && <LoadingSpinner size={16} className="text-white" />}
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <p className="mt-8 text-center text-xs text-muted">ⓒ 2026. Candidate Ranking System</p>
          </div>
        </section>
      </div>
    </div>
  );
}
