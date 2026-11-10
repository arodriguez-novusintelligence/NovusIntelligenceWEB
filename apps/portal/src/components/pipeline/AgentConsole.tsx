import { useEffect, useRef } from "react";
import { AlertTriangle, Brain, CheckCircle2, CircleDot, ListChecks, Terminal, XCircle, Zap } from "lucide-react";
import type { AgentEvent } from "@/api/client";
import { cn } from "@/lib/cn";
import { NadfMark } from "../NadfMark";

const ICON = {
  info: CircleDot,
  thought: Brain,
  tool: Terminal,
  stage: Zap,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
  plan: ListChecks,
} as const;

const TONE = {
  info: "text-muted-foreground",
  thought: "text-foreground",
  tool: "text-foreground/80 font-mono text-[12.5px]",
  stage: "text-foreground font-medium",
  success: "text-good",
  warning: "text-warn",
  error: "text-bad",
  plan: "text-foreground/90",
} as const;

const ICON_TONE = {
  info: "text-muted-foreground",
  thought: "text-secondary",
  tool: "text-primary",
  stage: "text-secondary",
  success: "text-good",
  warning: "text-warn",
  error: "text-bad",
  plan: "text-secondary",
} as const;

function time(iso: string) {
  return new Date(iso).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

/** Consola en vivo del agente: pensamientos, herramientas y etapas, como un chat de IA. */
export function AgentConsole({ events, working }: { events: AgentEvent[]; working: boolean }) {
  const end = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    // Solo baja sola si el usuario ya estaba al final (no le roba el scroll).
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 160) end.current?.scrollIntoView({ block: "end" });
  }, [events.length]);

  return (
    <div ref={box} className="max-h-[560px] min-h-[260px] overflow-y-auto pr-1" aria-live="polite" aria-label="Consola del agente">
      <ul className="space-y-2.5">
        {events.map((e) => {
          const Icon = ICON[e.kind] ?? CircleDot;
          return (
            <li key={e.id} className="flex animate-nadf-rise gap-3">
              <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", ICON_TONE[e.kind])} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className={cn("whitespace-pre-wrap break-words text-sm", TONE[e.kind])}>{e.text}</p>
              </div>
              <time className="shrink-0 font-mono text-[10px] text-muted-foreground/70" dateTime={e.at}>
                {time(e.at)}
              </time>
            </li>
          );
        })}
      </ul>
      {working && (
        <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
          <NadfMark size={22} />
          <span className="flex gap-1" aria-label="Trabajando">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-secondary [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-secondary" />
          </span>
        </div>
      )}
      <div ref={end} />
    </div>
  );
}
