import { API_URL, AUTH_STORAGE_KEY } from "@/constants";
import type {
  Applicant,
  CreateJobInput,
  Job,
  ScreeningResult,
  ShortlistSize,
  UmuravaProfile,
  User,
} from "@/types";

export class ApiError extends Error {
  constructor(public status: number, message: string, public details?: unknown) {
    super(message);
  }
}

function readTokenFromStorage(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { token?: string };
    return parsed.token ?? null;
  } catch {
    return null;
  }
}

async function apiFetch<T>(
  path: string,
  init: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const { auth = true, headers, ...rest } = init;
  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string> | undefined),
  };
  if (auth) {
    const token = readTokenFromStorage();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...rest, headers: finalHeaders });

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    const msg =
      (data && typeof data === "object" && "error" in data
        ? String((data as { error: unknown }).error)
        : null) ?? res.statusText ?? "Request failed";
    throw new ApiError(res.status, msg, data);
  }
  return data as T;
}

export async function loginApi(
  email: string,
  password: string
): Promise<{ token: string; user: User }> {
  return apiFetch("/api/auth/login", {
    method: "POST",
    auth: false,
    body: JSON.stringify({ email, password }),
  });
}

export async function listJobs(): Promise<Job[]> {
  return apiFetch("/api/jobs");
}

export async function createJob(input: CreateJobInput): Promise<Job> {
  return apiFetch("/api/jobs", { method: "POST", body: JSON.stringify(input) });
}

export async function getJob(id: string): Promise<Job> {
  return apiFetch(`/api/jobs/${id}`);
}

export async function listApplicants(jobId: string): Promise<Applicant[]> {
  return apiFetch(`/api/jobs/${jobId}/applicants`);
}

export async function addApplicants(
  jobId: string,
  profiles: UmuravaProfile[]
): Promise<{ added: number; applicants: Applicant[] }> {
  return apiFetch(`/api/jobs/${jobId}/applicants`, {
    method: "POST",
    body: JSON.stringify(profiles),
  });
}

export async function runScreeningApi(
  jobId: string,
  shortlistSize: ShortlistSize
): Promise<ScreeningResult> {
  return apiFetch(`/api/jobs/${jobId}/screen`, {
    method: "POST",
    body: JSON.stringify({ shortlistSize }),
  });
}

export async function getResultsApi(jobId: string): Promise<ScreeningResult | null> {
  return apiFetch(`/api/jobs/${jobId}/results`);
}
