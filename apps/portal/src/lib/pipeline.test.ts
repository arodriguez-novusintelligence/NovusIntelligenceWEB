import { describe, expect, it } from "vitest";
import { STEPS, activeAgent, isActive, safeRoute, stepIndex, timeAgo } from "./pipeline";

describe("pipeline", () => {
  it("ubica cada etapa en su paso", () => {
    expect(STEPS[stepIndex("queued", "queued")].id).toBe("understand");
    expect(STEPS[stepIndex("preflight", "developing")].id).toBe("preflight");
    expect(STEPS[stepIndex("developing", "developing")].id).toBe("develop");
    expect(STEPS[stepIndex("screenshots", "developing")].id).toBe("preview");
    expect(STEPS[stepIndex("awaiting_approval", "awaiting_approval")].id).toBe("approve");
    expect(STEPS[stepIndex("deploying", "deploying")].id).toBe("deploy");
    expect(STEPS[stepIndex("deployed", "deployed")].id).toBe("live");
  });

  it("estados activos", () => {
    expect(isActive("developing")).toBe(true);
    expect(isActive("awaiting_approval")).toBe(false);
    expect(isActive("deployed")).toBe(false);
  });

  it("agente activo por etapa", () => {
    expect(activeAgent("developing")).toBe("Desarrollador");
    expect(activeAgent("preflight")).toBe("Seguridad");
    expect(activeAgent("awaiting_approval")).toBeNull();
  });

  it("solo permite rutas internas en la ventana de la app", () => {
    expect(safeRoute("/eventos")).toBe("/eventos");
    expect(safeRoute("https://evil.com")).toBe("/");
    expect(safeRoute("//evil.com")).toBe("/");
    expect(safeRoute(undefined)).toBe("/");
  });

  it("tiempo relativo en español", () => {
    const now = new Date("2026-11-10T12:00:00Z");
    expect(timeAgo("2026-11-10T11:59:30Z", now)).toBe("hace segundos");
    expect(timeAgo("2026-11-10T11:30:00Z", now)).toBe("hace 30 min");
    expect(timeAgo("2026-11-09T12:00:00Z", now)).toBe("hace 1 día");
  });
});
