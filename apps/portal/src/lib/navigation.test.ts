import { describe, expect, it } from "vitest";
import { commandSuggestions, visibleNav, type Permission } from "./navigation";

const ADMIN: Permission[] = [
  "company.manage",
  "users.manage",
  "apps.manage",
  "connectors.manage",
  "agents.manage",
  "requests.create",
  "requests.submit",
  "reports.view",
  "reports.viewOwn",
  "approvals.decide",
  "deployments.view",
  "deployments.operate",
  "audit.view",
  "usage.view",
];

describe("visibleNav", () => {
  it("muestra al Admin todas las vistas, todas habilitadas", () => {
    const items = visibleNav([...ADMIN, "agents.define", "workflows.manage"]);
    expect(items.map((i) => i.id)).toEqual(["command", "requests", "approvals", "flows", "connectors", "agents", "team", "governance", "security"]);
    expect(items.every((i) => i.available)).toBe(true);
  });

  it("al Funcional no le muestra aprobaciones, equipo ni conectores", () => {
    const ids = visibleNav(["requests.create", "requests.submit", "reports.viewOwn", "deployments.view"]).map((i) => i.id);
    expect(ids).toEqual(["command", "requests", "flows", "agents", "security"]);
  });

  it("al Arquitecto le muestra flujos, conectores, agentes y gobierno, pero no equipo", () => {
    const ids = visibleNav(["agents.manage", "agents.define", "workflows.manage", "connectors.manage", "reports.view", "deployments.view", "audit.view"]).map((i) => i.id);
    expect(ids).toContain("agents");
    expect(ids).toContain("flows");
    expect(ids).toContain("governance");
    expect(ids).not.toContain("team");
  });
});

describe("commandSuggestions", () => {
  it("sugiere acciones según permisos, máximo tres", () => {
    expect(commandSuggestions(ADMIN)).toHaveLength(3);
    expect(commandSuggestions(["reports.view"])).toEqual(["¿Qué solicitudes están en curso?"]);
  });
});
