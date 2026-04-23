import { AlertCircle } from "lucide-react";

export function ErrorMessage({ message }: { message: string | null | undefined }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      <AlertCircle size={16} className="mt-0.5 shrink-0" />
      <p>{message}</p>
    </div>
  );
}
