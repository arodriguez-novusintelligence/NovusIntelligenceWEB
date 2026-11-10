import { fetchAuthSession } from "aws-amplify/auth";
import { config } from "@/config";
import type { Permission } from "@/lib/navigation";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

async function token(): Promise<string> {
  const session = await fetchAuthSession();
  const t = session.tokens?.idToken?.toString();
  if (!t) throw new ApiError(401, "NO_SESSION", "Tu sesión terminó. Vuelve a ingresar.");
  return t;
}

async function call<T>(method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE", path: string, body?: unknown): Promise<T> {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();
  if (!token) {
    throw new ApiError(401, "NO_SESSION", "Tu sesión terminó. Vuelve a ingresar.");
  }
  const res = await fetch(`${config.apiUrl}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = (await res.json().catch(() => ({}))) as { code?: string; message?: string };
  if (res.status === 404 && payload.message === "Not Found" && !payload.code) {
    throw new ApiError(404, "SERVICE_NOT_DEPLOYED", "Este servicio todavía no está disponible en el servidor: falta desplegar la actualización del backend del portal.");
  }
  if (!res.ok) {
    throw new ApiError(res.status, payload.code ?? "HTTP_ERROR", payload.message ?? "No pudimos comunicarnos con NADF.");
  }
  return payload as T;
}

export const apiGet = <T,>(path: string) => call<T>("GET", path);
export const apiPost = <T,>(path: string, body?: unknown) => call<T>("POST", path, body ?? {});
export const apiPut = <T,>(path: string, body?: unknown) => call<T>("PUT", path, body ?? {});
export const apiSend = <T,>(method: "PATCH" | "DELETE", path: string, body?: unknown) => call<T>(method, path, body);

export interface Me {
  user: { id: string; email: string; name: string | null; roles: string[]; mfaRequired: boolean };
  company: { id: string; name: string; country: string | null };
  permissions: Permission[];
}

export function getMe(): Promise<Me> {
  return apiGet<Me>("/api/v1/portal/me");
}

// ---------- Pipeline PROD ----------

export type RequestStatus =
  | "stopped"
  | "cancelled"
  | "planning"
  | "planned"
  | "rollback_requested"
  | "rollback_approved"
  | "rolling_back"
  | "queued"
  | "developing"
  | "awaiting_approval"
  | "approved"
  | "deploying"
  | "deployed"
  | "rejected"
  | "no_changes"
  | "blocked"
  | "failed"
  | "rolled_back";

export interface Actor {
  id: string;
  email: string;
  name?: string | null;
}

export interface ConnectedApp {
  id: string;
  name: string;
  description: string;
  url: string;
  repo: string;
}

export interface RequestSummary {
  requestId: string;
  appId: string;
  title: string;
  status: RequestStatus;
  stage: string | null;
  iteration: number;
  createdBy: Actor;
  createdAt: string;
  updatedAt: string;
  prUrl: string | null;
}

export interface TestResult {
  name: string;
  status: "passed" | "failed" | "skipped" | "warning";
  detail?: string;
}

export interface Report {
  titulo?: string;
  resumen?: string;
  hecho?: string[];
  no_hecho?: string[];
  limitaciones?: string[];
  preguntas?: string[];
  pruebas_sugeridas?: string[];
  rutas_a_revisar?: string[];
  riesgo?: string;
  archivos?: string[];
}

export type NodeStatus =
  | "PENDING"
  | "QUEUED"
  | "RUNNING"
  | "WAITING_DEPENDENCY"
  | "WAITING_APPROVAL"
  | "COMPLETED"
  | "FAILED"
  | "SKIPPED"
  | "CANCELLED"
  | "BLOCKED";

export interface NodeAttempt {
  iteration: number;
  startedAt: string;
  endedAt?: string;
  status: NodeStatus;
  durationMs?: number;
  metrics?: { model?: string; inputTokens?: number | null; outputTokens?: number | null; costUsd?: number | null; durationMs?: number; turns?: number | null; runtime?: string };
  output?: unknown;
  error?: { code: string; message: string };
  ioKey?: string;
  input?: unknown;
}

export interface NodeState {
  status: NodeStatus;
  attempts: NodeAttempt[];
  startedAt?: string | null;
  endedAt?: string | null;
  lastEvent?: string;
  metrics?: NodeAttempt["metrics"];
}

export interface WorkflowNode {
  id: string;
  agentId: string | null;
  label: string;
  role: string;
  kind: string;
  layer?: string | null;
  pattern?: string | null;
  model?: string | null;
  planned: "run" | "skip" | "done" | "conditional";
  reason?: string | null;
  definition?: { path?: string; responsibilities?: string[]; allowedTools?: string[]; mcpServers?: string[]; qualityGates?: string[] } | null;
}

export interface Workflow {
  version: number;
  profile: string;
  level?: string;
  mode?: string;
  confidence?: number;
  rationale?: string[];
  blocked?: boolean;
  blockReason?: string | null;
  legacy?: boolean;
  nodes: WorkflowNode[];
  edges: { id: string; source: string; target: string; label?: string | null }[];
  framework?: { repo?: string; sha?: string; branch?: string; dirty?: boolean };
  createdAt?: string;
  /** Política por naturaleza aplicada (agent-policy.yml). */
  policy?: { naturaleza: string; tamano?: string | null; critico: boolean; motivoCritico?: string | null; adrRequired: boolean; models?: { analysis?: string; development?: string }; budgetUsd?: number | null } | null;
}

export interface Rules {
  version: number;
  locked: boolean;
  lockedAt?: string;
  lockedBy?: Actor;
  nodes: Record<string, { mandatory: { text: string; source: string }[]; configurable: string[] }>;
  history: { version: number; at: string; by: string; nodeId?: string; before?: string[]; after?: string[]; note?: string }[];
}

export interface NodeIo {
  prompt?: { base?: string; instrucciones?: string; solicitud?: string; contexto?: Record<string, unknown>; version?: string } | null;
  input?: unknown;
  output?: unknown;
  artefactos?: unknown;
  tool?: string;
  framework?: { sha?: string; branch?: string };
  savedAt?: string;
}

export interface RequestDetail {
  requestId: string;
  appId: string;
  app: ConnectedApp | null;
  prompt: string;
  title?: string;
  status: RequestStatus;
  stage?: string;
  iteration: number;
  feedback?: { at: string; by: Actor; text: string }[];
  createdBy: Actor;
  createdAt: string;
  updatedAt: string;
  branch?: string;
  prUrl?: string;
  prNumber?: number;
  previewUrl?: string;
  report?: Report;
  tests?: TestResult[];
  screenshots: { label: string; url: string; kind?: string | null; route?: string | null }[];
  diffStat?: string;
  workflow: Workflow | null;
  nodeState: Record<string, NodeState>;
  rules?: Rules;
  classification?: { resumen?: string; criterios_aceptacion?: string[]; preguntas?: string[]; riesgo?: string } | null;
  planApproval?: { by: Actor; at: string };
  stopped?: { by: Actor; at: string; reason?: string; previousStatus: RequestStatus };
  cancelled?: { by: Actor; at: string; reason?: string };
  flowTemplate?: { id: string; name: string; version: number; agents: string[] } | null;
  attachments?: { key: string; name: string; contentType: string; size: number; kind: "image" | "text" | "word" | "pdf"; url: string }[];
  rollback?: { requestedBy: Actor; requestedAt: string; reason: string; risks: string[]; approvedBy?: Actor; approvedAt?: string; finishedAt?: string; revertPrUrl?: string | null; smoke?: TestResult[] } | null;
  headSha?: string;
  changedFiles?: string[];
  buildId?: string;
  costUsd?: number;
  decision?: { by: Actor; at: string; decision: DecisionKind; comment?: string };
  deployment: {
    environment?: string;
    url?: string;
    startedAt?: string;
    finishedAt?: string;
    buildId?: string;
    branch?: string;
    commit?: string;
    mergeCommit?: string | null;
    version?: string;
    approvedBy?: Actor;
    approvedAt?: string;
    verified?: boolean;
    smoke?: TestResult[];
    screenshots: { label: string; url: string }[];
    merged?: boolean;
  } | null;
  error?: { code: string; message: string } | null;
}

export interface AgentEvent {
  id: string;
  at: string;
  kind: "info" | "thought" | "tool" | "stage" | "success" | "warning" | "error" | "plan";
  text: string;
  stage?: string;
  nodeId?: string;
  eventType?: string;
  status?: string;
  iteration?: number;
  executionId?: string;
}

export const listApps = () => apiGet<{ apps: ConnectedApp[] }>("/api/v1/portal/apps").then((r) => r.apps);
export const listRequests = () => apiGet<{ requests: RequestSummary[] }>("/api/v1/portal/requests").then((r) => r.requests);
export const getRequest = (id: string, after?: string) =>
  apiGet<{ request: RequestDetail; events: AgentEvent[] }>(`/api/v1/portal/requests/${id}${after ? `?after=${encodeURIComponent(after)}` : ""}`);
export const createRequest = (prompt: string, appId?: string, flowId?: string, attachments: { key: string; name: string; contentType: string }[] = []) =>
  apiPost<{ request: RequestSummary }>("/api/v1/portal/requests", { prompt, appId, flowId: flowId || undefined, attachments }).then((r) => r.request);
export type DecisionKind = "approve" | "reject" | "changes" | "approve_rollback" | "reject_rollback";
export const updateRules = (id: string, nodeId: string, configurable: string[]) =>
  apiPut<{ rules: Rules }>(`/api/v1/portal/requests/${id}/rules`, { nodeId, configurable }).then((r) => r.rules);
export const startPlan = (id: string) => apiPost<{ status: RequestStatus }>(`/api/v1/portal/requests/${id}/start`);
export const requestRollback = (id: string, reason: string) => apiPost<{ status: RequestStatus; risks: string[] }>(`/api/v1/portal/requests/${id}/rollback`, { reason });
export const nodeIo = (id: string, nodeId: string, attempt?: number) =>
  apiGet<{ io: NodeIo | null }>(`/api/v1/portal/requests/${id}/nodes/${nodeId}${attempt ? `?attempt=${attempt}` : ""}`).then((r) => r.io);
/** Exportación: descarga el archivo (JSON o HTML); el HTML se puede imprimir como PDF. */
export async function exportRun(id: string, format: "json" | "html"): Promise<Blob> {
  const res = await fetch(`${config.apiUrl}/api/v1/portal/requests/${id}/export?format=${format}`, { headers: { Authorization: `Bearer ${await token()}` } });
  if (!res.ok) throw new ApiError(res.status, "EXPORT_FAILED", "No pudimos exportar las evidencias.");
  if (format === "json") {
    const data = (await res.json()) as { export: unknown };
    return new Blob([JSON.stringify(data.export, null, 2)], { type: "application/json" });
  }
  return new Blob([await res.text()], { type: "text/html;charset=utf-8" });
}
export const decide = (id: string, decision: DecisionKind, comment?: string) =>
  apiPost<{ status: RequestStatus }>(`/api/v1/portal/requests/${id}/decision`, { decision, comment });
export const previewSession = (id: string) =>
  apiPost<{ previewUrl: string; appOrigin: string; session: { token: string; userId: string; platformRole?: string } }>(
    `/api/v1/portal/requests/${id}/preview-session`,
  );
