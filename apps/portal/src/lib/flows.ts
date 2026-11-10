import type { Workflow, WorkflowNode } from "@/api/client";

/** Orden y forma del flujo tal como lo ejecuta el portal (espejo de runner/lib/framework.mjs#buildPlan). */
const LABEL: Record<string, string> = {
  request: "Solicitud",
  "requirement-classification-agent": "Analista",
  "complexity-router": "Complexity Router",
  orchestrator: "Orquestador",
  "prod-preflight": "Guardián PROD",
  "planner-agent": "Planificador",
  "architect-agent": "Arquitecto",
  "frontend-integration-agent": "Desarrollador",
  preview: "Vista previa",
  "qa-agent": "QA",
  "security-gate": "Guardas de seguridad",
  "security-agent": "Seguridad",
  "reviewer-agent": "Revisor",
  "pull-request": "Pull request",
  "human-approval": "Aprobación humana",
  rework: "Revisión",
  release: "Release PROD",
  "prod-verification": "Verificación PROD",
  result: "Resultado final",
};

export const BASE = ["request", "requirement-classification-agent", "qa-agent", "result"];
export const OPTIONAL = ["planner-agent", "architect-agent", "security-agent", "reviewer-agent"];

/** Vista previa del grafo que resultará al ejecutar con este flujo (los agentes no incluidos no aparecen). */
export function flowPreview(selected: string[]): Workflow {
  const on = (id: string) => selected.includes(id);
  const nodes: WorkflowNode[] = [];
  const edges: Workflow["edges"] = [];
  const add = (id: string, kind: string, planned: WorkflowNode["planned"] = "run") =>
    nodes.push({ id, agentId: id, label: LABEL[id] ?? id, role: "", kind, planned, reason: BASE.includes(id) ? "Flujo base" : OPTIONAL.includes(id) ? "Agregado al flujo" : "Control de la plataforma" });
  const link = (s: string, t: string, label?: string) => edges.push({ id: `${s}->${t}`, source: s, target: t, label: label ?? null });

  add("request", "input");
  add("requirement-classification-agent", "agent");
  add("complexity-router", "router");
  add("orchestrator", "orchestrator");
  add("prod-preflight", "gate");
  link("request", "requirement-classification-agent");
  link("requirement-classification-agent", "complexity-router");
  link("complexity-router", "orchestrator");
  link("orchestrator", "prod-preflight");
  let prev = "prod-preflight";
  for (const id of ["planner-agent", "architect-agent"]) {
    if (!on(id)) continue;
    add(id, "agent");
    link(prev, id);
    prev = id;
  }
  add("frontend-integration-agent", "agent");
  link(prev, "frontend-integration-agent");
  add("preview", "step");
  link("frontend-integration-agent", "preview");
  const parallel = ["qa-agent", "security-gate", ...(on("security-agent") ? ["security-agent"] : [])];
  add("qa-agent", "agent");
  add("security-gate", "gate");
  if (on("security-agent")) add("security-agent", "agent");
  parallel.forEach((id) => link("preview", id));
  if (on("reviewer-agent")) {
    add("reviewer-agent", "agent");
    parallel.forEach((id) => link(id, "reviewer-agent"));
    link("reviewer-agent", "pull-request");
  } else parallel.forEach((id) => link(id, "pull-request"));
  add("pull-request", "step");
  add("human-approval", "approval");
  link("pull-request", "human-approval");
  add("rework", "outcome", "conditional");
  add("release", "step", "conditional");
  link("human-approval", "release", "Aprobar");
  link("human-approval", "rework", "Rechazar / ajustes");
  add("prod-verification", "gate", "conditional");
  link("release", "prod-verification");
  add("result", "output");
  link("prod-verification", "result");
  link("rework", "result");
  return { version: 2, profile: "FLUJO", nodes, edges };
}

/** Normaliza la selección: solo opcionales válidos, sin repetir. */
export function normalizeSelection(list: string[]): string[] {
  return OPTIONAL.filter((id) => list.includes(id));
}
