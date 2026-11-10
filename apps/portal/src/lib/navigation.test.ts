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
  it("muestra al Admin todas las vistas", () => {
    expect(visibleNav(ADMIN).map((i) => i.id)).toEqual([
      "command",
      "requests",
      "approvals",
      "connectors",
      "agents",
      "team",
      "governance",
      "security",
    ]);
  });

  it("al Funcional no le muestra aprobaciones, equipo ni conectores", () => {
    const ids = visibleNav(["requests.create", "requests.submit", "reports.viewOwn", "deployments.view"]).map((i) => i.id);
    expect(ids).toEqual(["command", "requests", "security"]);
  });

  it("habilita solo lo que corresponde a la fase actual", () => {
    const fase0 = visibleNav(ADMIN, 0).filter((i) => i.available).map((i) => i.id);
    expect(fase0).toEqual(["command", "security"]);
    const fase1 = visibleNav(ADMIN, 1).filter((i) => i.available).map((i) => i.id);
    expect(fase1).toContain("team");
    expect(fase1).not.toContain("approvals");
  });
});

describe("commandSuggestions", () => {
  it("sugiere acciones según permisos, máximo tres", () => {
    expect(commandSuggestions(ADMIN)).toHaveLength(3);
    expect(commandSuggestions(["reports.view"])).toEqual(["¿Qué solicitudes están en curso?"]);
  });
});
