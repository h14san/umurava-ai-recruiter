import { cn } from "@/lib/utils";

export function Avatar({
  firstName,
  lastName,
  size = 40,
  className,
}: {
  firstName: string;
  lastName: string;
  size?: number;
  className?: string;
}) {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700",
        className
      )}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials}
    </div>
  );
}
