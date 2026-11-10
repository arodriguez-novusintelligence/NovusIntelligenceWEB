import { describe, expect, it } from "vitest";
import type { AgentEvent, Workflow } from "@/api/client";
import { diffRules, functionalSummary, layoutWorkflow, mergeEvents, milestones, parallelGroups, statusOf, toolsUsed } from "./studio";

// Plan con la misma forma que produce runner/lib/framework.mjs#buildPlan (perfil FULL: validación en paralelo).
const WF: Workflow = {
  version: 2,
  profile: "FULL",
  nodes: [
    { id: "request", agentId: null, label: "Solicitud", role: "", kind: "input", planned: "done" },
    { id: "prod-preflight", agentId: "devops-agent", label: "Guardián PROD", role: "", kind: "gate", planned: "run" },
    { id: "architect-agent", agentId: "architect-agent", label: "Arquitecto", role: "", kind: "agent", planned: "skip", reason: "Omitido" },
    { id: "frontend-integration-agent", agentId: "frontend-integration-agent", label: "Desarrollador", role: "", kind: "agent", planned: "run" },
    { id: "preview", agentId: "devops-agent", label: "Vista previa", role: "", kind: "step", planned: "run" },
    { id: "qa-agent", agentId: "qa-agent", label: "QA", role: "", kind: "agent", planned: "run" },
    { id: "security-gate", agentId: null, label: "Guardas", role: "", kind: "gate", planned: "run" },
    { id: "security-agent", agentId: "security-agent", label: "Seguridad", role: "", kind: "agent", planned: "run" },
    { id: "pull-request", agentId: "devops-agent", label: "PR", role: "", kind: "step", planned: "run" },
    { id: "human-approval", agentId: null, label: "Aprobación humana", role: "", kind: "approval", planned: "run" },
    { id: "release", agentId: "devops-agent", label: "Release", role: "", kind: "step", planned: "conditional" },
  ],
  edges: [
    ["request", "prod-preflight"],
    ["prod-preflight", "architect-agent"],
    ["architect-agent", "frontend-integration-agent"],
    ["frontend-integration-agent", "preview"],
    ["preview", "qa-agent"],
    ["preview", "security-gate"],
    ["preview", "security-agent"],
    ["qa-agent", "pull-request"],
    ["security-gate", "pull-request"],
    ["security-agent", "pull-request"],
    ["pull-request", "human-approval"],
    ["human-approval", "release"],
  ].map(([source, target]) => ({ id: `${source}->${target}`, source, target })),
};

describe("studio", () => {
  it("ubica los nodos por dependencia y los paralelos en la misma fila", () => {
    const pos = layoutWorkflow(WF);
    expect(pos["prod-preflight"].rank).toBe(1);
    expect(pos["frontend-integration-agent"].rank).toBe(3);
    expect(pos["qa-agent"].rank).toBe(pos["security-agent"].rank);
    expect(pos["qa-agent"].x).not.toBe(pos["security-agent"].x);
    expect(pos["pull-request"].rank).toBe(pos["qa-agent"].rank + 1);
    expect(parallelGroups(WF)).toContainEqual(expect.arrayContaining(["qa-agent", "security-gate", "security-agent"]));
  });

  it("estado real del backend; sin estado usa la decisión del plan", () => {
    const arch = WF.nodes.find((n) => n.id === "architect-agent")!;
    expect(statusOf(arch)).toBe("SKIPPED");
    expect(statusOf(WF.nodes[3], { status: "RUNNING", attempts: [] })).toBe("RUNNING");
    expect(statusOf(WF.nodes[3])).toBe("PENDING");
  });

  it("no marca En producción sin despliegue y verificación", () => {
    const base = { status: "deploying" as const, decision: { decision: "approve" as const, by: { id: "a", email: "a" }, at: "x" }, deployment: null };
    const m = milestones({ ...base, nodeState: { "frontend-integration-agent": { status: "COMPLETED", attempts: [] }, "qa-agent": { status: "COMPLETED", attempts: [] }, release: { status: "COMPLETED", attempts: [] } } });
    expect(m).toMatchObject({ IMPLEMENTED: true, TESTED: true, APPROVED: true, DEPLOYED: true, VERIFIED: false });
    const ok = milestones({ ...base, status: "deployed", deployment: { verified: true, screenshots: [] }, nodeState: { release: { status: "COMPLETED", attempts: [] }, "prod-verification": { status: "COMPLETED", attempts: [] } } });
    expect(ok.VERIFIED).toBe(true);
    const rb = milestones({ ...base, status: "rolled_back", deployment: { verified: true, screenshots: [] }, nodeState: { release: { status: "COMPLETED", attempts: [] }, "prod-verification": { status: "COMPLETED", attempts: [] } } });
    expect(rb.DEPLOYED).toBe(false);
  });

  it("une eventos sin duplicados y en orden (reconexión y recuperación)", () => {
    const e = (id: string, nodeId?: string, kind: AgentEvent["kind"] = "info"): AgentEvent => ({ id, at: id.split("#")[0], kind, text: id, nodeId });
    const a = [e("2026-11-10T10:00:00Z#000001"), e("2026-11-10T10:00:01Z#000002")];
    const merged = mergeEvents(a, [e("2026-11-10T10:00:01Z#000002"), e("2026-11-10T10:00:00.5Z#000003"), e("2026-11-10T10:00:02Z#000004", "qa-agent", "tool")]);
    expect(merged.map((x) => x.id)).toEqual(["2026-11-10T10:00:00.5Z#000003", "2026-11-10T10:00:00Z#000001", "2026-11-10T10:00:01Z#000002", "2026-11-10T10:00:02Z#000004"].sort());
    expect(toolsUsed(merged, "qa-agent")).toHaveLength(1);
    expect(toolsUsed(merged, "security-agent")).toHaveLength(0);
  });

  it("vista funcional: quién trabaja, qué falta y qué necesita a una persona", () => {
    const s = functionalSummary({ workflow: WF, status: "developing", nodeState: { "frontend-integration-agent": { status: "RUNNING", attempts: [], lastEvent: "Editando Banner.tsx" } } });
    expect(s.agent).toBe("Desarrollador");
    expect(s.doing).toContain("Editando Banner.tsx");
    expect(s.pending).toContain("QA");
    expect(s.pending).not.toContain("Release");
    expect(functionalSummary({ workflow: WF, status: "planned", nodeState: {} }).needsYou).toContain("Ejecutar plan");
    expect(functionalSummary({ workflow: WF, status: "awaiting_approval", nodeState: { "human-approval": { status: "WAITING_APPROVAL", attempts: [] } } }).needsYou).toContain("Aprobación humana");
  });

  it("compara reglas antes de guardar", () => {
    expect(diffRules(["a", "b"], ["b", "c"])).toEqual({ added: ["c"], removed: ["a"] });
  });
});

describe("foco del canvas", () => {
  it("enfoca el nodo seleccionado y sus vecinos; si no, lo activo; si no, el inicio", async () => {
    const { focusNodes } = await import("./studio");
    expect(focusNodes(WF, {}, "preview").sort()).toEqual(["frontend-integration-agent", "preview", "qa-agent", "security-agent", "security-gate"].sort());
    expect(focusNodes(WF, { "human-approval": { status: "WAITING_APPROVAL", attempts: [] } }, null)).toContain("human-approval");
    expect(focusNodes(WF, {}, null)).toEqual(["request", "prod-preflight", "architect-agent", "frontend-integration-agent"]);
  });
});
