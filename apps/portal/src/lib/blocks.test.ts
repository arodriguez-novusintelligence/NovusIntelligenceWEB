import { describe, expect, it } from "vitest";
import { blockKind } from "./blocks";

const r = (code: string, blockReason?: string) => ({ error: { code, message: "x" }, workflow: blockReason ? ({ blockReason } as never) : null });

describe("tipo de bloqueo", () => {
  it("revisión y seguridad se pueden corregir o aceptar", () => {
    expect(blockKind(r("REVIEW_BLOCKED"))).toBe("review");
    expect(blockKind(r("SECURITY_REVIEW_BLOCKED"))).toBe("review");
  });
  it("plan por backend ofrece solo web; otros planes, aclarar", () => {
    expect(blockKind(r("PLAN_BLOCKED", "El pedido necesita cambios en el backend"))).toBe("plan_backend");
    expect(blockKind(r("PLAN_BLOCKED", "información insuficiente"))).toBe("plan_other");
  });
  it("PROD distinto de main y secretos no se pueden omitir", () => {
    expect(blockKind(r("PROD_DIFFERS_FROM_MAIN"))).toBe("prod");
    expect(blockKind(r("MAIN_CHANGED"))).toBe("prod");
    expect(blockKind(r("SECRET_IN_DIFF"))).toBe("secret");
  });
});
