import { useEffect, useMemo, useState } from "react";
import {
  Sparkles,
  FileText,
  Figma,
  Github,
  Workflow,
  Brain,
  Palette,
  Code2,
  ShieldCheck,
  Rocket,
  GitBranch,
  Globe,
  Bell,
  Package,
  Play,
  RotateCcw,
  Pause,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/Dialog";

export const NOVUS_DEMO_EVENT = "novus:open-dev-framework";

type ColKey = "trigger" | "engine" | "agents" | "actions";

type Item = { id: string; label: string; icon: LucideIcon };

const TRIGGERS: Item[] = [
  { id: "prompt", label: "Prompt Lovable", icon: Sparkles },
  { id: "brief", label: "Brief negocio", icon: FileText },
  { id: "figma", label: "Figma", icon: Figma },
  { id: "issue", label: "GitHub Issue", icon: Github },
];

const AGENTS: Item[] = [
  { id: "planner", label: "Planner Agent", icon: Brain },
  { id: "design", label: "Design Agent", icon: Palette },
  { id: "code", label: "Code Agent", icon: Code2 },
  { id: "qa", label: "QA & Policy", icon: ShieldCheck },
];

const ACTIONS: Item[] = [
  { id: "repo", label: "Repo GitHub", icon: GitBranch },
  { id: "deploy", label: "Deploy AWS", icon: Rocket },
  { id: "preview", label: "URL de preview", icon: Globe },
  { id: "notify", label: "Notificación", icon: Bell },
];

type Step = {
  id: string;
  col: ColKey;
  itemId?: string;
  log: string;
};

const STEPS: Step[] = [
  {
    id: "s1",
    col: "trigger",
    itemId: "prompt",
    log: 'Trigger: prompt Lovable → "App B2B para gestión de leads con dashboard".',
  },
  {
    id: "s2",
    col: "engine",
    log: "NovusAIDevelopmentFramework recibe la intención y arma el plan de ejecución.",
  },
  {
    id: "s3",
    col: "agents",
    itemId: "planner",
    log: "Planner Agent: define arquitectura (React + AWS Lambda + SES).",
  },
  {
    id: "s4",
    col: "agents",
    itemId: "design",
    log: "Design Agent: genera design system y wireframes con tokens de marca.",
  },
  {
    id: "s5",
    col: "agents",
    itemId: "code",
    log: "Code Agent: implementa rutas, componentes y servicios API.",
  },
  {
    id: "s6",
    col: "agents",
    itemId: "qa",
    log: "QA & Policy: pruebas, accesibilidad y validación de datos sensibles.",
  },
  {
    id: "s7",
    col: "actions",
    itemId: "repo",
    log: "Commit y push al repo (branch: feat/lead-manager).",
  },
  {
    id: "s8",
    col: "actions",
    itemId: "deploy",
    log: "Deploy en AWS (S3 + CloudFront + API Gateway + Lambda).",
  },
  {
    id: "s9",
    col: "actions",
    itemId: "preview",
    log: "URL de preview lista: leadmgr.novus.dev — producto entregado.",
  },
];

const STEP_MS = 1200;
const COLS: ColKey[] = ["trigger", "engine", "agents", "actions"];

function useSimulation(open: boolean) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setPlaying(true);
  }, [open]);

  useEffect(() => {
    if (!playing) return;
    if (step >= STEPS.length - 1) {
      setPlaying(false);
      return;
    }
    const id = window.setTimeout(() => setStep((s) => s + 1), STEP_MS);
    return () => window.clearTimeout(id);
  }, [playing, step]);

  return {
    step,
    playing,
    setStep,
    play: () => {
      if (step >= STEPS.length - 1) setStep(0);
      setPlaying(true);
    },
    pause: () => setPlaying(false),
    reset: () => {
      setStep(0);
      setPlaying(true);
    },
    finished: step >= STEPS.length - 1 && !playing,
  };
}

function Column({
  title,
  index,
  items,
  activeCol,
  activeItem,
  reachedCol,
}: {
  title: string;
  index: number;
  items: Item[];
  activeCol: ColKey;
  activeItem?: string;
  reachedCol: number;
}) {
  const isActive = COLS[index] === activeCol;
  const isReached = index <= reachedCol;

  return (
    <div
      className={[
        "relative rounded-2xl border p-4 transition-all duration-500",
        isActive
          ? "border-primary/60 bg-gradient-card shadow-glow"
          : isReached
            ? "border-primary/25 bg-gradient-card"
            : "border-border/60 bg-card/40",
      ].join(" ")}
    >
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gradient-brand text-[10px] font-bold text-primary-foreground">
          {index + 1}
        </span>
        <span className={isActive ? "text-primary" : ""}>{title}</span>
      </div>
      <ul className="space-y-2">
        {items.map((it) => {
          const Icon = it.icon;
          const active = isActive && activeItem === it.id;
          return (
            <li
              key={it.id}
              className={[
                "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all",
                active
                  ? "border-primary/60 bg-primary/10 text-foreground"
                  : "border-border/50 bg-background/40 text-muted-foreground",
              ].join(" ")}
            >
              <Icon className={["h-4 w-4 shrink-0", active ? "text-primary" : ""].join(" ")} />
              <span className={active ? "font-medium text-foreground" : ""}>{it.label}</span>
              {active && (
                <span className="ml-auto h-1.5 w-1.5 animate-novus-pulse rounded-full bg-primary" />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function EngineColumn({
  active,
  reached,
  playing,
}: {
  active: boolean;
  reached: boolean;
  playing: boolean;
}) {
  return (
    <div
      className={[
        "relative overflow-hidden rounded-2xl border p-4 transition-all duration-500",
        active
          ? "border-secondary/60 bg-gradient-card shadow-glow"
          : reached
            ? "border-secondary/25 bg-gradient-card"
            : "border-border/60 bg-card/40",
      ].join(" ")}
    >
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gradient-brand text-[10px] font-bold text-primary-foreground">
          2
        </span>
        <span className={active ? "text-primary" : ""}>Framework</span>
      </div>

      <div className="rounded-xl border border-border/60 bg-navy-surface/60 p-3">
        <div className="flex items-center gap-2">
          <Workflow className="h-4 w-4 text-primary" />
          <div className="font-display text-sm font-semibold">
            Novus<span className="text-gradient-brand">AI</span>DevelopmentFramework
          </div>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Orquestador multiagente para automatizar desarrollo
        </p>

        <div className="relative mt-3 h-28 rounded-lg border border-border/60 bg-background/60">
          <div className="absolute inset-0 grid-bg opacity-40" aria-hidden />
          <svg viewBox="0 0 200 80" className="absolute inset-0 h-full w-full">
            <defs>
              <linearGradient id="devEdge" x1="0" x2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
                <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity="0.9" />
              </linearGradient>
            </defs>
            {[
              { x1: 25, y1: 40, x2: 75, y2: 25 },
              { x1: 25, y1: 40, x2: 75, y2: 55 },
              { x1: 75, y1: 25, x2: 130, y2: 40 },
              { x1: 75, y1: 55, x2: 130, y2: 40 },
              { x1: 130, y1: 40, x2: 180, y2: 40 },
            ].map((e, i) => (
              <g key={i}>
                <line
                  x1={e.x1}
                  y1={e.y1}
                  x2={e.x2}
                  y2={e.y2}
                  stroke="url(#devEdge)"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  opacity={active ? 1 : 0.4}
                />
                {active && playing && (
                  <circle r="1.4" fill="hsl(var(--primary))">
                    <animateMotion
                      dur="1.4s"
                      repeatCount="indefinite"
                      path={`M ${e.x1} ${e.y1} L ${e.x2} ${e.y2}`}
                    />
                  </circle>
                )}
              </g>
            ))}
            {[
              { x: 25, y: 40 },
              { x: 75, y: 25 },
              { x: 75, y: 55 },
              { x: 130, y: 40 },
              { x: 180, y: 40 },
            ].map((n, i) => (
              <circle
                key={i}
                cx={n.x}
                cy={n.y}
                r="4"
                fill="hsl(var(--navy-deep))"
                stroke="url(#devEdge)"
                strokeWidth="1.2"
              />
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}

function BetweenArrow({ active }: { active: boolean }) {
  return (
    <div className="hidden items-center justify-center lg:flex" aria-hidden>
      <svg viewBox="0 0 40 20" className="h-6 w-10">
        <defs>
          <linearGradient id="arrowGrad" x1="0" x2="1">
            <stop
              offset="0%"
              stopColor="hsl(var(--primary))"
              stopOpacity={active ? 1 : 0.35}
            />
            <stop
              offset="100%"
              stopColor="hsl(var(--secondary))"
              stopOpacity={active ? 1 : 0.35}
            />
          </linearGradient>
        </defs>
        <path
          d="M2 10 L32 10 M26 4 L34 10 L26 16"
          stroke="url(#arrowGrad)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export function NovusDevFrameworkDemo({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const sim = useSimulation(open);
  const current = STEPS[sim.step];
  const reachedIdx = useMemo(() => COLS.indexOf(current.col), [current]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-6xl overflow-hidden p-0">
      <div className="relative bg-gradient-hero px-6 py-5">
        <div className="absolute inset-0 grid-bg opacity-30" aria-hidden />
        <DialogHeader className="relative pr-8">
          <DialogTitle className="text-2xl">
            <span className="text-gradient-brand">NovusAIDevelopmentFramework</span> · Simulación
          </DialogTitle>
          <DialogDescription>
            Arquitectura multiagéntica que automatiza el desarrollo de un producto desde un prompt
            de Lovable hasta el deploy en AWS.
          </DialogDescription>
        </DialogHeader>
      </div>

      <div className="px-6 py-6">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] lg:items-stretch">
          <Column
            title="Triggers"
            index={0}
            items={TRIGGERS}
            activeCol={current.col}
            activeItem={current.itemId}
            reachedCol={reachedIdx}
          />
          <BetweenArrow active={reachedIdx >= 1} />
          <EngineColumn
            active={current.col === "engine"}
            reached={reachedIdx >= 1}
            playing={sim.playing}
          />
          <BetweenArrow active={reachedIdx >= 2} />
          <Column
            title="Agentes IA"
            index={2}
            items={AGENTS}
            activeCol={current.col}
            activeItem={current.itemId}
            reachedCol={reachedIdx}
          />
          <BetweenArrow active={reachedIdx >= 3} />
          <Column
            title="Entregables"
            index={3}
            items={ACTIONS}
            activeCol={current.col}
            activeItem={current.itemId}
            reachedCol={reachedIdx}
          />
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <div className="rounded-xl border border-border/60 bg-background/70 px-4 py-3 font-mono text-xs">
            <span className="text-primary">
              [{String(sim.step + 1).padStart(2, "0")}/{STEPS.length}]
            </span>{" "}
            <span className="text-foreground/90">{current.log}</span>
          </div>
          <div className="flex items-center gap-2">
            {sim.playing ? (
              <Button size="sm" variant="outline" onClick={sim.pause}>
                <Pause className="h-3.5 w-3.5" /> Pausa
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={sim.play}>
                <Play className="h-3.5 w-3.5" /> Reproducir
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={sim.reset}>
              <RotateCcw className="h-3.5 w-3.5" /> Reiniciar
            </Button>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-1">
          {STEPS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => sim.setStep(i)}
              aria-label={`Paso ${i + 1}`}
              className={[
                "h-1.5 flex-1 rounded-full transition-all",
                i <= sim.step ? "bg-gradient-brand" : "bg-border",
              ].join(" ")}
            />
          ))}
        </div>

        <div
          className={[
            "mt-6 overflow-hidden rounded-2xl border p-5 transition-all duration-500",
            sim.finished
              ? "border-primary/50 bg-gradient-card shadow-glow"
              : "border-border/60 bg-card/40 opacity-70",
          ].join(" ")}
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground">
              <Package className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                {sim.finished ? "Producto entregado" : "En construcción…"}
              </div>
              <h3 className="mt-1 font-display text-lg font-bold">Lead Manager B2B — MVP funcional</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Aplicación React + AWS generada desde un prompt de Lovable, con dashboard,
                autenticación, API y deploy automático.
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                {["React", "Tailwind", "AWS Lambda", "SES", "CI/CD"].map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-border/60 bg-background/60 px-2 py-0.5 text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="hidden text-right sm:block">
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Tiempo</div>
              <div className="font-display text-2xl font-bold text-gradient-brand">
                {sim.finished ? "~9 min" : "…"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
