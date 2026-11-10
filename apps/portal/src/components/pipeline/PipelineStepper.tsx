import { Check, X } from "lucide-react";
import type { RequestStatus } from "@/api/client";
import { cn } from "@/lib/cn";
import { STEPS, isActive, stepIndex } from "@/lib/pipeline";

const FAILED: RequestStatus[] = ["failed", "blocked", "rolled_back", "rejected", "no_changes"];

/** Pasos del pipeline PROD. El paso actual "respira" mientras la IA trabaja. */
export function PipelineStepper({ status, stage }: { status: RequestStatus; stage?: string | null }) {
  const current = stepIndex(stage, status);
  const stopped = FAILED.includes(status);
  const working = isActive(status);

  return (
    <ol className="flex gap-1 overflow-x-auto pb-1" aria-label="Avance del pipeline a producción">
      {STEPS.map((step, i) => {
        const done = i < current || status === "deployed";
        const here = i === current && status !== "deployed";
        return (
          <li key={step.id} className="flex min-w-[96px] flex-1 flex-col items-center gap-1.5 text-center" aria-current={here ? "step" : undefined}>
            <div className="flex w-full items-center">
              <span className={cn("h-px flex-1", i === 0 ? "opacity-0" : done || here ? "bg-gradient-to-r from-primary to-secondary" : "bg-white/10")} />
              <span
                className={cn(
                  "relative inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-mono text-[11px]",
                  done && "border-good/50 bg-good/15 text-good",
                  here && !stopped && "border-transparent bg-gradient-to-br from-primary to-secondary text-white",
                  here && stopped && "border-bad/50 bg-bad/15 text-bad",
                  !done && !here && "border-white/15 text-muted-foreground",
                )}
              >
                {here && working && <span className="absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-primary to-secondary opacity-70 blur-md animate-nadf-breathe" />}
                {done ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : here && stopped ? <X className="h-3.5 w-3.5" aria-hidden="true" /> : i + 1}
              </span>
              <span className={cn("h-px flex-1", i === STEPS.length - 1 ? "opacity-0" : done ? "bg-gradient-to-r from-primary to-secondary" : "bg-white/10")} />
            </div>
            <span className={cn("px-1 text-[11px] leading-tight", here ? "text-foreground" : "text-muted-foreground")}>{step.label}</span>
          </li>
        );
      })}
    </ol>
  );
}
