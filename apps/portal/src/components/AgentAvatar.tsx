import { cn } from "@/lib/cn";

export type AgentState = "idle" | "thinking" | "running" | "waiting" | "done";

const STATE_LABEL: Record<AgentState, string> = {
  idle: "En espera",
  thinking: "Pensando",
  running: "Ejecutando",
  waiting: "Espera a una persona",
  done: "Terminado",
};

const STATE_DOT: Record<AgentState, string> = {
  idle: "bg-muted-foreground/60",
  thinking: "bg-secondary",
  running: "bg-primary",
  waiting: "bg-warn",
  done: "bg-good",
};

/** Avatar de un agente NADF con su estado. Los activos "respiran". */
export function AgentAvatar({ name, initials, state, detail }: { name: string; initials: string; state: AgentState; detail?: string }) {
  const active = state === "thinking" || state === "running";
  return (
    <div className="flex items-center gap-3">
      <span className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center">
        {active && <span className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-secondary opacity-60 blur-md animate-nadf-breathe" />}
        <span
          className={cn(
            "relative inline-flex h-10 w-10 items-center justify-center rounded-full border font-mono text-xs font-medium",
            active ? "border-transparent bg-gradient-to-br from-primary to-secondary text-white" : "border-white/15 bg-white/[0.04] text-foreground/80",
          )}
        >
          {initials}
        </span>
        <span className={cn("absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background", STATE_DOT[state])} />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-foreground">{name}</span>
        <span className="block truncate text-xs text-muted-foreground">{detail ?? STATE_LABEL[state]}</span>
      </span>
    </div>
  );
}
