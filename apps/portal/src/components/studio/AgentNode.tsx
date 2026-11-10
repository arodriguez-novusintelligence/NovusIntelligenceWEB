import { memo, useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
  AlertOctagon,
  Ban,
  Bot,
  CheckCircle2,
  CircleDashed,
  Clock,
  FileInput,
  Check,
  X,
  Flag,
  GitBranch,
  Hand,
  Loader2,
  Network,
  ShieldCheck,
  SkipForward,
  XCircle,
} from "lucide-react";
import type { NodeState, NodeStatus, WorkflowNode } from "@/api/client";
import { cn } from "@/lib/cn";
import { STATUS_LABEL, duration, elapsed } from "@/lib/studio";
import { attemptCost, usd } from "@/lib/cost";

export interface NodeDecision {
  /** Texto del botón afirmativo y de la confirmación. */
  approveLabel: string;
  confirmText: string;
  disabledReason?: string | null;
  onApprove: () => Promise<void>;
  onDeny: () => Promise<void>;
}

export interface AgentNodeData extends Record<string, unknown> {
  node: WorkflowNode;
  state?: NodeState;
  status: NodeStatus;
  selected: boolean;
  technical: boolean;
  decision?: NodeDecision | null;
}

/** Aprobar / Denegar dentro del nodo, con confirmación; llama al backend real de aprobaciones. */
function DecisionButtons({ decision }: { decision: NodeDecision }) {
  const [confirm, setConfirm] = useState<"approve" | "deny" | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
      setConfirm(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();
  return (
    <div className="nodrag nopan relative mt-2 space-y-1.5" onClick={stop} onPointerDown={stop}>
      {!confirm ? (
        <div className="flex gap-1.5">
          <button type="button" className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-good/80 px-2 py-1 text-[11px] font-semibold text-white disabled:opacity-40" disabled={Boolean(decision.disabledReason)} title={decision.disabledReason ?? undefined} onClick={() => setConfirm("approve")}>
            <Check className="h-3 w-3" aria-hidden="true" /> {decision.approveLabel}
          </button>
          <button type="button" className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-bad/60 px-2 py-1 text-[11px] font-semibold text-bad" onClick={() => setConfirm("deny")}>
            <X className="h-3 w-3" aria-hidden="true" /> Denegar
          </button>
        </div>
      ) : (
        <div className="space-y-1.5 rounded-lg border border-white/15 bg-black/40 p-2">
          <p className="text-[11px] text-foreground">{confirm === "approve" ? decision.confirmText : "¿Denegar? Se registra y no se despliega."}</p>
          <div className="flex gap-1.5">
            <button type="button" className="flex-1 rounded-lg bg-white/15 px-2 py-1 text-[11px] font-semibold disabled:opacity-50" disabled={busy} onClick={() => void run(confirm === "approve" ? decision.onApprove : decision.onDeny)}>
              {busy ? <Loader2 className="mx-auto h-3 w-3 animate-spin" aria-hidden="true" /> : "Confirmar"}
            </button>
            <button type="button" className="flex-1 rounded-lg px-2 py-1 text-[11px] text-muted-foreground" disabled={busy} onClick={() => setConfirm(null)}>
              Cancelar
            </button>
          </div>
        </div>
      )}
      {decision.disabledReason && !confirm && <p className="text-[10px] text-warn">{decision.disabledReason}</p>}
      {error && <p className="text-[10px] text-bad" role="alert">{error}</p>}
    </div>
  );
}

const KIND_ICON = {
  input: FileInput,
  router: Network,
  orchestrator: GitBranch,
  gate: ShieldCheck,
  approval: Hand,
  outcome: Flag,
  output: Flag,
  step: GitBranch,
  agent: Bot,
} as const;

const STATUS_ICON: Partial<Record<NodeStatus, typeof CheckCircle2>> = {
  COMPLETED: CheckCircle2,
  FAILED: XCircle,
  BLOCKED: AlertOctagon,
  SKIPPED: SkipForward,
  CANCELLED: Ban,
  WAITING_APPROVAL: Hand,
  QUEUED: Clock,
  PENDING: CircleDashed,
  WAITING_DEPENDENCY: Clock,
};

const STATUS_TONE: Record<NodeStatus, string> = {
  PENDING: "border-white/12 bg-white/[0.03]",
  QUEUED: "border-primary/40 bg-primary/[0.06]",
  RUNNING: "border-transparent bg-[hsl(265_30%_13%)]",
  WAITING_DEPENDENCY: "border-white/15 bg-white/[0.03]",
  WAITING_APPROVAL: "border-warn/70 bg-warn/[0.08] shadow-[0_0_28px_hsl(var(--warn)/0.25)]",
  COMPLETED: "border-good/40 bg-good/[0.06]",
  FAILED: "border-bad/60 bg-bad/[0.08]",
  SKIPPED: "border-dashed border-white/10 bg-transparent opacity-50",
  CANCELLED: "border-dashed border-white/10 bg-transparent opacity-50",
  BLOCKED: "border-bad/60 bg-bad/[0.08]",
};

const BADGE_TONE: Record<NodeStatus, string> = {
  PENDING: "text-muted-foreground",
  QUEUED: "text-primary",
  RUNNING: "text-secondary",
  WAITING_DEPENDENCY: "text-muted-foreground",
  WAITING_APPROVAL: "text-warn",
  COMPLETED: "text-good",
  FAILED: "text-bad",
  SKIPPED: "text-muted-foreground",
  CANCELLED: "text-muted-foreground",
  BLOCKED: "text-bad",
};

/** Nodo del canvas: su estado sale del backend (nodeState); nunca de un cálculo local. */
function AgentNodeView({ data }: NodeProps) {
  const { node, state, status, selected, technical, decision } = data as AgentNodeData;
  const Icon = KIND_ICON[node.kind as keyof typeof KIND_ICON] ?? Bot;
  const SIcon = status === "RUNNING" ? Loader2 : STATUS_ICON[status] ?? CircleDashed;
  const attempts = state?.attempts?.length ?? 0;
  const spent = (state?.attempts ?? []).reduce((acc, a) => acc + attemptCost(a.metrics).usd, 0);
  const ms = elapsed(state);
  return (
    <div
      className={cn(
        "relative w-[210px] rounded-2xl border px-3 py-2.5 text-left backdrop-blur transition",
        STATUS_TONE[status],
        selected && "ring-2 ring-secondary/70",
        node.planned === "conditional" && status === "PENDING" && "border-dashed",
      )}
    >
      {status === "RUNNING" && <span className="nadf-running-border pointer-events-none absolute -inset-px rounded-2xl" aria-hidden="true" />}
      <Handle type="target" position={Position.Top} className="!h-2 !w-2 !border-0 !bg-white/30" />
      <div className="relative flex items-start gap-2.5">
        <span
          className={cn(
            "mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
            status === "RUNNING" ? "bg-gradient-to-br from-primary to-secondary text-white" : "bg-white/[0.06] text-foreground/80",
          )}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{node.label}</p>
          <p className={cn("flex items-center gap-1 text-[11px]", BADGE_TONE[status])}>
            <SIcon className={cn("h-3 w-3", status === "RUNNING" && "animate-spin")} aria-hidden="true" />
            {STATUS_LABEL[status]}
            {ms != null && status !== "SKIPPED" && <span className="text-muted-foreground"> · {duration(ms)}</span>}
            {spent > 0 && <span className="text-muted-foreground"> · {usd(spent)}</span>}
          </p>
          {technical && node.agentId && <p className="truncate font-mono text-[10px] text-muted-foreground/80">{node.agentId}</p>}
        </div>
        {attempts > 1 && (
          <span className="rounded-md border border-secondary/40 px-1 font-mono text-[10px] text-secondary" title={`${attempts} intentos`}>
            ×{attempts}
          </span>
        )}
      </div>
      {state?.lastEvent && status !== "SKIPPED" && <p className="relative mt-1.5 line-clamp-2 text-[11px] text-muted-foreground">{state.lastEvent}</p>}
      {status === "SKIPPED" && node.reason && <p className="relative mt-1.5 line-clamp-2 text-[11px] text-muted-foreground">{node.reason}</p>}
      {decision && <DecisionButtons decision={decision} />}
      <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !border-0 !bg-white/30" />
    </div>
  );
}

export const AgentNode = memo(AgentNodeView);
