import { AlertCircle } from "lucide-react";

export function ErrorMessage({ message }: { message: string | null | undefined }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-2 rounded-[12px] border border-[var(--danger)]/35 bg-[var(--danger-soft)] px-3 py-2.5 text-sm text-[var(--danger)]">
      <AlertCircle size={16} className="mt-0.5 shrink-0" />
      <p>{message}</p>
    </div>
  );
}
