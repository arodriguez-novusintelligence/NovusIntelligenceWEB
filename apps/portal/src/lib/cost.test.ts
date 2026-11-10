import { describe, expect, it } from "vitest";
import { attemptCost, compactTokens, costBreakdown, usd } from "./cost";

const wf = { version: 2, profile: "FULL", nodes: [{ id: "dev", label: "Desarrollador" }, { id: "an", label: "Analista" }], edges: [] } as never;

describe("costo acumulado", () => {
  it("usa el costo guardado y estima solo lo antiguo", () => {
    expect(attemptCost({ costUsd: 0.37 })).toEqual({ usd: 0.37, estimated: false });
    expect(attemptCost({ model: "claude-opus-5-5", inputTokens: 1_000_000, outputTokens: 100_000 })).toEqual({ usd: 6, estimated: true });
  });

  it("desglosa por agente (mayor primero), por iteración y total", () => {
    const b = costBreakdown(wf, {
      dev: { status: "COMPLETED", attempts: [
        { iteration: 1, startedAt: "x", status: "COMPLETED", metrics: { costUsd: 1.85, inputTokens: 3_492_154, outputTokens: 36_757, model: "claude-opus-5-5" } },
        { iteration: 2, startedAt: "x", status: "COMPLETED", metrics: { costUsd: 2.36, inputTokens: 4_498_640, outputTokens: 46_111, model: "claude-opus-5-5" } },
      ] },
      an: { status: "COMPLETED", attempts: [{ iteration: 1, startedAt: "x", status: "COMPLETED", metrics: { costUsd: 0.02, inputTokens: 3158, outputTokens: 2152, model: "claude-sonnet-5-5" } }] },
      qa: { status: "COMPLETED", attempts: [{ iteration: 1, startedAt: "x", status: "COMPLETED" }] },
    });
    expect(b.byNode.map((n) => n.label)).toEqual(["Desarrollador", "Analista"]);
    expect(b.total).toBeCloseTo(4.23, 2);
    expect(b.byIteration).toEqual([{ iteration: 1, usd: 1.87 }, { iteration: 2, usd: 2.36 }].map((x) => ({ ...x, usd: expect.closeTo(x.usd, 5) })));
    expect(b.byNode[0].attempts).toBe(2);
    expect(b.estimated).toBe(false);
  });

  it("formatos en español", () => {
    expect(usd(1.85)).toBe("1,85 USD");
    expect(usd(0.004)).toBe("< 0,01 USD");
    expect(compactTokens(3_492_154)).toBe("3,49 M");
    expect(compactTokens(2152)).toBe("2 mil");
  });
});
