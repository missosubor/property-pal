import type { TenancyStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const map: Record<TenancyStatus, { label: string; className: string }> = {
  PAID: { label: "Paid", className: "bg-success text-success-foreground" },
  PARTIAL: { label: "Partial", className: "bg-warning text-warning-foreground" },
  LATE: { label: "Late", className: "bg-destructive text-destructive-foreground" },
  UPCOMING: { label: "Upcoming", className: "bg-secondary text-secondary-foreground" },
};

export default function StatusBadge({ status }: { status: TenancyStatus }) {
  const s = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide",
        s.className,
      )}
    >
      {s.label}
    </span>
  );
}