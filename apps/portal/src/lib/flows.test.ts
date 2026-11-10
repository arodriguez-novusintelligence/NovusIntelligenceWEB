import { describe, expect, it } from "vitest";
import { BASE, flowPreview, normalizeSelection } from "./flows";

describe("constructor de flujos", () => {
  it("el flujo base siempre incluye Solicitud, Analista, QA y Resultado final más los controles", () => {
    const ids = flowPreview([]).nodes.map((n) => n.id);
    for (const id of [...BASE, "prod-preflight", "security-gate", "human-approval", "release", "prod-verification"]) expect(ids).toContain(id);
    expect(ids).not.toContain("architect-agent");
  });

  it("agrega los opcionales en su lugar y la seguridad en paralelo con QA", () => {
    const wf = flowPreview(["architect-agent", "security-agent", "reviewer-agent"]);
    expect(wf.edges.some((e) => e.source === "prod-preflight" && e.target === "architect-agent")).toBe(true);
    expect(wf.edges.some((e) => e.source === "architect-agent" && e.target === "frontend-integration-agent")).toBe(true);
    expect(wf.edges.filter((e) => e.source === "preview").map((e) => e.target).sort()).toEqual(["qa-agent", "security-agent", "security-gate"]);
    expect(wf.edges.some((e) => e.source === "reviewer-agent" && e.target === "pull-request")).toBe(true);
  });

  it("todas las aristas apuntan a nodos existentes", () => {
    const wf = flowPreview(["planner-agent", "architect-agent", "security-agent", "reviewer-agent"]);
    const ids = new Set(wf.nodes.map((n) => n.id));
    expect(wf.edges.every((e) => ids.has(e.source) && ids.has(e.target))).toBe(true);
  });

  it("normaliza: solo opcionales, sin duplicados ni agentes no ejecutables", () => {
    expect(normalizeSelection(["reviewer-agent", "database-agent", "reviewer-agent", "planner-agent"])).toEqual(["planner-agent", "reviewer-agent"]);
  });
});
