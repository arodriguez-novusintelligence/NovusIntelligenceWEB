import type { RequestDetail } from "@/api/client";

export type BlockKind = "review" | "plan_backend" | "plan_other" | "prod" | "secret" | "other";

/** Tipo de bloqueo → qué opciones son válidas (los que protegen PROD o secretos no se pueden omitir). */
export function blockKind(r: Pick<RequestDetail, "error" | "workflow">): BlockKind {
  const code = r.error?.code ?? "";
  if (code === "REVIEW_BLOCKED" || code === "SECURITY_REVIEW_BLOCKED") return "review";
  if (code === "PLAN_BLOCKED") return /backend/i.test(r.workflow?.blockReason ?? r.error?.message ?? "") ? "plan_backend" : "plan_other";
  if (["PROD_DIFFERS_FROM_MAIN", "PROD_CHANGED", "MAIN_CHANGED"].includes(code)) return "prod";
  if (code === "SECRET_IN_DIFF") return "secret";
  return "other";
}

