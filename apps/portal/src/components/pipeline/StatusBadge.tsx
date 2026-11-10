import type { RequestStatus } from "@/api/client";
import { cn } from "@/lib/cn";
import { STATUS, TONE_CLASS, isActive } from "@/lib/pipeline";

export function StatusBadge({ status, className }: { status: RequestStatus; className?: string }) {
  const meta = STATUS[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium", TONE_CLASS[meta.tone], className)}>
      {isActive(status) && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary/70" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-secondary" />
        </span>
      )}
      {meta.label}
    </span>
  );
}
