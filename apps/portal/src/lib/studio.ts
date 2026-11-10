import type { AgentEvent, NodeState, NodeStatus, RequestDetail, Workflow, WorkflowNode } from "@/api/client";

/** Posición de cada nodo: capas por dependencia (los paralelos quedan en la misma fila). */
export function layoutWorkflow(wf: Workflow, opts = { colWidth: 250, rowHeight: 140 }) {
  const incoming = new Map<string, string[]>();
  for (const n of wf.nodes) incoming.set(n.id, []);
  for (const e of wf.edges) incoming.get(e.target)?.push(e.source);
  const rank = new Map<string, number>();
  const visit = (id: string, stack = new Set<string>()): number => {
    if (rank.has(id)) return rank.get(id)!;
    if (stack.has(id)) return 0;
    stack.add(id);
    const parents = incoming.get(id) ?? [];
    const r = parents.length ? Math.max(...parents.map((p) => visit(p, stack))) + 1 : 0;
    rank.set(id, r);
    return r;
  };
  wf.nodes.forEach((n) => visit(n.id));
  const rows = new Map<number, string[]>();
  for (const n of wf.nodes) {
    const r = rank.get(n.id) ?? 0;
    rows.set(r, [...(rows.get(r) ?? []), n.id]);
  }
  const pos: Record<string, { x: number; y: number; rank: number }> = {};
  for (const [r, ids] of rows) {
    ids.forEach((id, i) => {
      pos[id] = { x: (i - (ids.length - 1) / 2) * opts.colWidth, y: r * opts.rowHeight, rank: r };
    });
  }
  return pos;
}

/** Ramas paralelas reales: nodos que comparten fila. */
export function parallelGroups(wf: Workflow): string[][] {
  const pos = layoutWorkflow(wf);
  const byRank = new Map<number, string[]>();
  for (const [id, p] of Object.entries(pos)) byRank.set(p.rank, [...(byRank.get(p.rank) ?? []), id]);
  return [...byRank.values()].filter((ids) => ids.length > 1);
}

export function statusOf(node: WorkflowNode, state?: NodeState): NodeStatus {
  if (state?.status) return state.status;
  if (node.planned === "skip") return "SKIPPED";
  if (node.planned === "done") return "COMPLETED";
  return "PENDING";
}

export const STATUS_LABEL: Record<NodeStatus, string> = {
  PENDING: "Pendiente",
  QUEUED: "En cola",
  RUNNING: "Ejecutando",
  WAITING_DEPENDENCY: "Esperando dependencia",
  WAITING_APPROVAL: "Espera aprobación",
  COMPLETED: "Completado",
  FAILED: "Falló",
  SKIPPED: "Omitido",
  CANCELLED: "Cancelado",
  BLOCKED: "Bloqueado",
};

/** Etapas reales del cambio. "En producción" solo con despliegue Y verificación confirmados. */
export type Milestone = "IMPLEMENTED" | "TESTED" | "APPROVED" | "DEPLOYED" | "VERIFIED";
export const MILESTONE_LABEL: Record<Milestone, string> = {
  IMPLEMENTED: "Implementado",
  TESTED: "Probado",
  APPROVED: "Aprobado",
  DEPLOYED: "Desplegado",
  VERIFIED: "Verificado",
};

export function milestones(r: Pick<RequestDetail, "nodeState" | "status" | "deployment" | "decision">): Record<Milestone, boolean> {
  const done = (id: string) => r.nodeState?.[id]?.status === "COMPLETED";
  const rolledBack = r.status === "rolled_back";
  return {
    IMPLEMENTED: done("frontend-integration-agent") || done("pull-request"),
    TESTED: done("qa-agent"),
    APPROVED: r.decision?.decision === "approve",
    DEPLOYED: done("release") && !rolledBack,
    VERIFIED: done("prod-verification") && Boolean(r.deployment?.verified) && !rolledBack,
  };
}

/** Une eventos nuevos sin duplicados y en orden (el id es "fecha#secuencia"). */
export function mergeEvents(prev: AgentEvent[], incoming: AgentEvent[]): AgentEvent[] {
  if (!incoming.length) return prev;
  const seen = new Set(prev.map((e) => e.id));
  const merged = [...prev, ...incoming.filter((e) => !seen.has(e.id))];
  return merged.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

export function eventsFor(events: AgentEvent[], nodeId: string) {
  return events.filter((e) => e.nodeId === nodeId);
}

/** Herramientas REALMENTE usadas por un nodo (solo eventos de herramienta registrados). */
export function toolsUsed(events: AgentEvent[], nodeId: string) {
  return eventsFor(events, nodeId).filter((e) => e.kind === "tool");
}

/** Vista funcional: qué pasa, quién trabaja, qué falta y si se necesita a alguien. */
export function functionalSummary(r: Pick<RequestDetail, "workflow" | "nodeState" | "status">) {
  const wf = r.workflow;
  if (!wf) return { doing: "Preparando la solicitud.", agent: null, pending: [] as string[], needsYou: null as string | null };
  const running = wf.nodes.filter((n) => r.nodeState?.[n.id]?.status === "RUNNING");
  const waiting = wf.nodes.find((n) => r.nodeState?.[n.id]?.status === "WAITING_APPROVAL");
  const pending = wf.nodes.filter((n) => ["PENDING", "QUEUED"].includes(statusOf(n, r.nodeState?.[n.id])) && n.planned !== "conditional").map((n) => n.label);
  const needsYou =
    r.status === "planned"
      ? "Revisa el plan y pulsa «Ejecutar plan»."
      : waiting
        ? `${waiting.label}: se necesita una decisión.`
        : ["blocked", "no_changes", "failed"].includes(r.status)
          ? "La ejecución se detuvo: revisa el motivo y decide."
          : null;
  return {
    doing: running.length ? running.map((n) => `${n.label}: ${r.nodeState[n.id]?.lastEvent ?? "trabajando"}`).join(" · ") : r.status === "planning" ? "NADF está planificando." : "Nadie trabajando en este momento.",
    agent: running.map((n) => n.label).join(", ") || null,
    pending,
    needsYou,
  };
}

export function duration(ms?: number | null) {
  if (ms == null) return "—";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  return `${m} min ${s % 60} s`;
}

export function elapsed(state?: NodeState, now = Date.now()) {
  if (!state?.startedAt) return null;
  const end = state.endedAt ? Date.parse(state.endedAt) : now;
  return end - Date.parse(state.startedAt);
}

/** Diferencias entre dos listas de reglas (para la comparación antes de guardar). */
export function diffRules(before: string[], after: string[]) {
  return {
    added: after.filter((r) => !before.includes(r)),
    removed: before.filter((r) => !after.includes(r)),
  };
}
