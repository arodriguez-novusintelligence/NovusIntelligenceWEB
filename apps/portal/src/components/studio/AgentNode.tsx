import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
  AlertOctagon,
  Ban,
  Bot,
  CheckCircle2,
  CircleDashed,
  Clock,
  FileInput,
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

export interface AgentNodeData extends Record<string, unknown> {
  node: WorkflowNode;
  state?: NodeState;
  status: NodeStatus;
  selected: boolean;
  technical: boolean;
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
  const { node, state, status, selected, technical } = data as AgentNodeData;
  const Icon = KIND_ICON[node.kind as keyof typeof KIND_ICON] ?? Bot;
  const SIcon = status === "RUNNING" ? Loader2 : STATUS_ICON[status] ?? CircleDashed;
  const attempts = state?.attempts?.length ?? 0;
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
      <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !border-0 !bg-white/30" />
    </div>
  );
}

export const AgentNode = memo(AgentNodeView);
