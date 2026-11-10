import type { NodeAttempt, NodeState, Workflow } from "@/api/client";

/** Tarifa oficial (USD/MTok, consultada 2026-11-10) solo para ejecuciones antiguas sin costo guardado. */
const PRICING: Record<string, { input: number; output: number }> = {
  "claude-opus-5-5": { input: 4, output: 20 },
  "claude-sonnet-5-5": { input: 2, output: 10 },
  "claude-haiku-5-5": { input: 0.1, output: 0.5 },
};

export interface AttemptCost {
  usd: number;
  estimated: boolean;
}

export function attemptCost(m?: NodeAttempt["metrics"]): AttemptCost {
  if (!m) return { usd: 0, estimated: false };
  if (typeof m.costUsd === "number") return { usd: m.costUsd, estimated: false };
  const price = PRICING[String(m.model ?? "").split(" ")[0]];
  if (!price || (!m.inputTokens && !m.outputTokens)) return { usd: 0, estimated: false };
  return { usd: ((m.inputTokens ?? 0) * price.input + (m.outputTokens ?? 0) * price.output) / 1e6, estimated: true };
}

export interface NodeCost {
  nodeId: string;
  label: string;
  usd: number;
  estimated: boolean;
  inputTokens: number;
  outputTokens: number;
  attempts: number;
  models: string[];
}

export interface CostBreakdown {
  total: number;
  estimated: boolean;
  byNode: NodeCost[];
  byIteration: { iteration: number; usd: number }[];
  tokens: { input: number; output: number };
}

/** Costo acumulado de una ejecución: por agente, por iteración y total (todo desde lo persistido). */
export function costBreakdown(workflow: Workflow | null, nodeState: Record<string, NodeState>): CostBreakdown {
  const byNode: NodeCost[] = [];
  const iters = new Map<number, number>();
  let estimated = false;
  for (const [nodeId, st] of Object.entries(nodeState ?? {})) {
    let usd = 0;
    let est = false;
    let input = 0;
    let output = 0;
    const models = new Set<string>();
    for (const a of st.attempts ?? []) {
      const c = attemptCost(a.metrics);
      usd += c.usd;
      est ||= c.estimated && c.usd > 0;
      input += a.metrics?.inputTokens ?? 0;
      output += a.metrics?.outputTokens ?? 0;
      if (a.metrics?.model) models.add(String(a.metrics.model).split(" ")[0]);
      if (c.usd > 0) iters.set(a.iteration ?? 1, (iters.get(a.iteration ?? 1) ?? 0) + c.usd);
    }
    if (usd <= 0) continue;
    estimated ||= est;
    byNode.push({
      nodeId,
      label: workflow?.nodes.find((n) => n.id === nodeId)?.label ?? nodeId,
      usd,
      estimated: est,
      inputTokens: input,
      outputTokens: output,
      attempts: st.attempts?.length ?? 0,
      models: [...models],
    });
  }
  byNode.sort((a, b) => b.usd - a.usd);
  const total = byNode.reduce((acc, n) => acc + n.usd, 0);
  return {
    total,
    estimated,
    byNode,
    byIteration: [...iters.entries()].sort(([a], [b]) => a - b).map(([iteration, usd]) => ({ iteration, usd })),
    tokens: { input: byNode.reduce((a, n) => a + n.inputTokens, 0), output: byNode.reduce((a, n) => a + n.outputTokens, 0) },
  };
}

export function usd(value: number) {
  return value < 0.01 && value > 0 ? "< 0,01 USD" : `${value.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;
}

export function compactTokens(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toLocaleString("es-CO", { maximumFractionDigits: 2 })} M`;
  if (n >= 1_000) return `${Math.round(n / 1_000).toLocaleString("es-CO")} mil`;
  return n.toLocaleString("es-CO");
}
