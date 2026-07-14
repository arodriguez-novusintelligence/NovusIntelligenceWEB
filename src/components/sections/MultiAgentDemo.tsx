import { useEffect, useMemo, useState } from "react";
import {
  Bot,
  Brain,
  Cloud,
  Database,
  Layout,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/utils/cn";

type NodeId =
  | "user"
  | "frontend"
  | "orchestrator"
  | "research"
  | "data"
  | "policy"
  | "infra";

interface DemoNode {
  id: NodeId;
  label: string;
  sub: string;
  icon: LucideIcon;
  x: number;
  y: number;
  tone: "primary" | "secondary" | "muted";
}

interface DemoEdge {
  from: NodeId;
  to: NodeId;
  label: string;
}

const DEMO_NODES: DemoNode[] = [
  { id: "user", label: "Usuario", sub: "Solicitud de negocio", icon: Sparkles, x: 8, y: 50, tone: "muted" },
  { id: "frontend", label: "Frontend Web", sub: "React + Router", icon: Layout, x: 26, y: 50, tone: "primary" },
  { id: "orchestrator", label: "Orquestador", sub: "Router · memoria · plan", icon: Brain, x: 50, y: 50, tone: "secondary" },
  { id: "research", label: "Agente Research", sub: "RAG · web · docs", icon: Bot, x: 74, y: 18, tone: "primary" },
  { id: "data", label: "Agente Data", sub: "SQL · analytics", icon: Database, x: 78, y: 50, tone: "primary" },
  { id: "policy", label: "Agente Policy", sub: "Validación · aprobación", icon: ShieldCheck, x: 74, y: 82, tone: "secondary" },
  { id: "infra", label: "AWS Lambda + API", sub: "Ejecución segura", icon: Cloud, x: 94, y: 50, tone: "muted" },
];

const DEMO_EDGES: DemoEdge[] = [
  { from: "user", to: "frontend", label: "prompt" },
  { from: "frontend", to: "orchestrator", label: "intent" },
  { from: "orchestrator", to: "research", label: "consulta" },
  { from: "orchestrator", to: "data", label: "query" },
  { from: "orchestrator", to: "policy", label: "validar" },
  { from: "research", to: "infra", label: "tool call" },
  { from: "data", to: "infra", label: "tool call" },
  { from: "policy", to: "infra", label: "tool call" },
];

const NODE_MAP = Object.fromEntries(DEMO_NODES.map((n) => [n.id, n])) as Record<NodeId, DemoNode>;

const TIMELINE = [
  { edge: 0, log: "Usuario → Frontend: “Analiza churn del último trimestre”." },
  { edge: 1, log: "Frontend → Orquestador: intent = análisis + recomendación." },
  { edge: 2, log: "Orquestador → Research: recupera contexto y benchmarks." },
  { edge: 3, log: "Orquestador → Data: consulta métricas y cohortes." },
  { edge: 4, log: "Orquestador → Policy: valida uso de datos sensibles." },
  { edge: 5, log: "Research → AWS: ejecuta búsqueda vectorial (Lambda)." },
  { edge: 6, log: "Data → AWS: corre query analítica en API Gateway." },
  { edge: 7, log: "Policy → AWS: registra decisión en audit log." },
];

function toneStyles(tone: DemoNode["tone"]) {
  switch (tone) {
    case "primary":
      return { ring: "ring-primary/50", bg: "bg-primary/15", icon: "text-primary" };
    case "secondary":
      return { ring: "ring-secondary/50", bg: "bg-secondary/15", icon: "text-secondary" };
    default:
      return { ring: "ring-border", bg: "bg-muted/40", icon: "text-muted-foreground" };
  }
}

function edgePath(from: DemoNode, to: DemoNode): string {
  const x1 = from.x;
  const y1 = from.y;
  const x2 = to.x;
  const y2 = to.y;
  const cx = (x1 + x2) / 2;
  return `M ${x1} ${y1} Q ${cx} ${y1} ${x2} ${y2}`;
}

export function MultiAgentDemo() {
  const reducedMotion = useReducedMotion();
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(!reducedMotion);

  useEffect(() => {
    if (!playing || reducedMotion) return;
    const id = window.setInterval(() => {
      setStep((s) => (s + 1) % TIMELINE.length);
    }, 1800);
    return () => window.clearInterval(id);
  }, [playing, reducedMotion]);

  const activeEdgeIdx = TIMELINE[step].edge;
  const activeEdge = DEMO_EDGES[activeEdgeIdx];
  const activeNodes = useMemo(
    () => new Set<NodeId>([activeEdge.from, activeEdge.to]),
    [activeEdge],
  );

  return (
    <section className="border-t border-border/60 bg-navy-surface/40 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              Ejemplo · Arquitectura multiagéntica
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
              Cómo colaboran los agentes{" "}
              <span className="text-gradient-brand">en tiempo real</span>
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Frontend productivo, orquestador con memoria, agentes especializados e infraestructura
              serverless en AWS. Observa el flujo de una solicitud extremo a extremo.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              className="rounded-full border border-border/60 bg-background/60 px-4 py-2 text-xs font-semibold uppercase tracking-widest transition hover:border-primary/60 hover:text-primary"
            >
              {playing ? "Pausar" : "Reproducir"}
            </button>
            <button
              type="button"
              onClick={() => setStep((s) => (s + 1) % TIMELINE.length)}
              className="rounded-full border border-border/60 bg-background/60 px-4 py-2 text-xs font-semibold uppercase tracking-widest transition hover:border-primary/60 hover:text-primary"
            >
              Paso ▸
            </button>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-card p-4 shadow-elevated sm:p-6">
          <div className="absolute inset-0 grid-bg opacity-30" aria-hidden />

          <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
            <svg
              viewBox="0 0 100 100"
              className="absolute inset-0 h-full w-full"
              aria-hidden
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <linearGradient id="edge-active" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(220 85% 55%)" />
                  <stop offset="100%" stopColor="hsl(295 70% 55%)" />
                </linearGradient>
              </defs>

              {DEMO_EDGES.map((edge, idx) => {
                const from = NODE_MAP[edge.from];
                const to = NODE_MAP[edge.to];
                const isActive = idx === activeEdgeIdx;
                return (
                  <g key={`${edge.from}-${edge.to}`}>
                    <path
                      d={edgePath(from, to)}
                      fill="none"
                      stroke={isActive ? "url(#edge-active)" : "hsl(265 20% 30%)"}
                      strokeWidth={isActive ? 0.6 : 0.35}
                      strokeOpacity={isActive ? 1 : 0.5}
                    />
                    {!reducedMotion && isActive && (
                      <circle r="0.8" fill="hsl(220 85% 65%)">
                        <animateMotion dur="1.8s" repeatCount="indefinite" path={edgePath(from, to)} />
                      </circle>
                    )}
                  </g>
                );
              })}
            </svg>

            {DEMO_NODES.map((node) => {
              const styles = toneStyles(node.tone);
              const Icon = node.icon;
              const isActive = activeNodes.has(node.id);
              return (
                <div
                  key={node.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                >
                  <div
                    className={cn(
                      "flex w-24 flex-col items-center rounded-xl border p-2 text-center transition sm:w-28",
                      styles.bg,
                      isActive ? cn("ring-2", styles.ring, "scale-105") : "opacity-80",
                    )}
                  >
                    <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", styles.icon)} />
                    <span className="mt-1 text-[10px] font-semibold leading-tight sm:text-xs">
                      {node.label}
                    </span>
                    <span className="hidden text-[9px] text-muted-foreground sm:block">{node.sub}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="relative mt-4 rounded-xl border border-border/60 bg-background/60 p-4">
            <div className="flex items-center gap-2">
              {TIMELINE.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setStep(idx)}
                  aria-label={`Paso ${idx + 1}`}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition",
                    idx === step ? "bg-primary" : "bg-border/60 hover:bg-primary/40",
                  )}
                />
              ))}
            </div>
            <p className="mt-3 font-mono text-xs leading-relaxed text-muted-foreground">
              {TIMELINE[step].log}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
