import type { RequestStatus } from "@/api/client";

/** Pasos del pipeline PROD con revisión, tal como los ve el usuario. */
export const STEPS = [
  { id: "understand", label: "Entender", stages: ["queued", "preparing", "cloning", "installing"] },
  { id: "preflight", label: "Verificar PROD", stages: ["preflight"] },
  { id: "develop", label: "Desarrollar", stages: ["developing"] },
  { id: "test", label: "Probar", stages: ["testing"] },
  { id: "preview", label: "Vista previa", stages: ["preview", "screenshots", "pr"] },
  { id: "approve", label: "Aprobación", stages: ["awaiting_approval", "approved"] },
  { id: "deploy", label: "Desplegar en PROD", stages: ["deploy_checks", "deploying"] },
  { id: "verify", label: "Verificar PROD", stages: ["verifying"] },
  { id: "live", label: "En producción", stages: ["deployed"] },
] as const;

export function stepIndex(stage: string | null | undefined, status: RequestStatus): number {
  if (status === "deployed") return STEPS.length - 1;
  if (status === "awaiting_approval" || status === "approved") return STEPS.findIndex((s) => s.id === "approve");
  const idx = STEPS.findIndex((s) => (s.stages as readonly string[]).includes(stage ?? ""));
  return idx >= 0 ? idx : 0;
}

export const ACTIVE: RequestStatus[] = ["queued", "developing", "approved", "deploying"];
export const isActive = (status: RequestStatus) => ACTIVE.includes(status);

export const STATUS: Record<RequestStatus, { label: string; tone: "info" | "ai" | "warn" | "good" | "bad" | "muted" }> = {
  queued: { label: "En cola", tone: "info" },
  developing: { label: "La IA está trabajando", tone: "ai" },
  awaiting_approval: { label: "Espera aprobación", tone: "warn" },
  approved: { label: "Aprobado", tone: "ai" },
  deploying: { label: "Desplegando en PROD", tone: "ai" },
  deployed: { label: "En producción", tone: "good" },
  rejected: { label: "Rechazado", tone: "muted" },
  no_changes: { label: "Sin cambios", tone: "warn" },
  blocked: { label: "Bloqueado por seguridad", tone: "bad" },
  failed: { label: "Falló", tone: "bad" },
  rolled_back: { label: "Revertido", tone: "bad" },
};

export const TONE_CLASS: Record<(typeof STATUS)[RequestStatus]["tone"], string> = {
  info: "border-primary/40 bg-primary/10 text-primary",
  ai: "border-secondary/40 bg-gradient-to-r from-primary/15 to-secondary/15 text-foreground",
  warn: "border-warn/40 bg-warn/10 text-warn",
  good: "border-good/40 bg-good/10 text-good",
  bad: "border-bad/40 bg-bad/10 text-bad",
  muted: "border-white/15 bg-white/[0.04] text-muted-foreground",
};

/** Qué agente NADF está activo según la etapa (para el centro de mando). */
export function activeAgent(stage: string | null | undefined): string | null {
  switch (stage) {
    case "queued":
    case "preparing":
    case "cloning":
    case "installing":
      return "Orquestador";
    case "preflight":
    case "deploy_checks":
      return "Seguridad";
    case "developing":
      return "Desarrollador";
    case "testing":
    case "screenshots":
    case "verifying":
      return "QA";
    case "preview":
    case "pr":
    case "deploying":
      return "Release";
    default:
      return null;
  }
}

/** Ruta segura para la ventana de la app (solo paths internos). */
export function safeRoute(route: string | undefined): string {
  if (!route || !route.startsWith("/") || route.startsWith("//")) return "/";
  return route.slice(0, 300);
}

export function timeAgo(iso: string, now: Date = new Date()): string {
  const s = Math.max(0, Math.round((now.getTime() - new Date(iso).getTime()) / 1000));
  if (s < 60) return "hace segundos";
  const m = Math.round(s / 60);
  if (m < 60) return `hace ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.round(h / 24);
  return `hace ${d} día${d === 1 ? "" : "s"}`;
}
