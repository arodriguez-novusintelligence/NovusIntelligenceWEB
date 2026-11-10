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

async function call<T>(method: "GET" | "POST", path: string, body?: unknown): Promise<T> {
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
  if (!res.ok) {
    throw new ApiError(res.status, payload.code ?? "HTTP_ERROR", payload.message ?? "No pudimos comunicarnos con NADF.");
  }
  return payload as T;
}

export const apiGet = <T,>(path: string) => call<T>("GET", path);
export const apiPost = <T,>(path: string, body?: unknown) => call<T>("POST", path, body ?? {});

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
  screenshots: { label: string; url: string }[];
  diffStat?: string;
  costUsd?: number;
  decision?: { by: Actor; at: string; decision: "approve" | "reject" | "changes"; comment?: string };
  deployment: { startedAt?: string; finishedAt?: string; smoke?: TestResult[]; screenshots: { label: string; url: string }[]; merged?: boolean } | null;
  error?: { code: string; message: string } | null;
}

export interface AgentEvent {
  id: string;
  at: string;
  kind: "info" | "thought" | "tool" | "stage" | "success" | "warning" | "error" | "plan";
  text: string;
  stage?: string;
}

export const listApps = () => apiGet<{ apps: ConnectedApp[] }>("/api/v1/portal/apps").then((r) => r.apps);
export const listRequests = () => apiGet<{ requests: RequestSummary[] }>("/api/v1/portal/requests").then((r) => r.requests);
export const getRequest = (id: string, after?: string) =>
  apiGet<{ request: RequestDetail; events: AgentEvent[] }>(`/api/v1/portal/requests/${id}${after ? `?after=${encodeURIComponent(after)}` : ""}`);
export const createRequest = (prompt: string, appId?: string) =>
  apiPost<{ request: RequestSummary }>("/api/v1/portal/requests", { prompt, appId }).then((r) => r.request);
export const decide = (id: string, decision: "approve" | "reject" | "changes", comment?: string) =>
  apiPost<{ status: RequestStatus }>(`/api/v1/portal/requests/${id}/decision`, { decision, comment });
export const previewSession = (id: string) =>
  apiPost<{ previewUrl: string; appOrigin: string; session: { token: string; userId: string; platformRole?: string } }>(
    `/api/v1/portal/requests/${id}/preview-session`,
  );
