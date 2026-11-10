import { ApiError, apiGet, apiPost, apiPut, apiSend, type Actor, type RequestStatus } from "./client";

// ---------- Control de ejecución ----------
export const stopRequest = (id: string, reason?: string) => apiPost<{ status: RequestStatus }>(`/api/v1/portal/requests/${id}/stop`, { reason });
export const resumeRequest = (id: string) => apiPost<{ status: RequestStatus }>(`/api/v1/portal/requests/${id}/resume`);
export const cancelRequest = (id: string, reason?: string) => apiPost<{ status: RequestStatus }>(`/api/v1/portal/requests/${id}/cancel`, { reason });

// ---------- Equipo ----------
export interface TeamMember {
  userId: string;
  email: string;
  name?: string;
  roles: string[];
  status: "active" | "invited" | "disabled";
  createdAt?: string;
  lastSeenAt?: string;
  cognito?: { status: string; enabled: boolean; mfa: boolean } | null;
}
export const listTeam = () => apiGet<{ members: TeamMember[]; assignableRoles: string[] }>("/api/v1/portal/team");
export const createMember = (input: { email: string; name: string; roles: string[] }) => apiPost<{ member: TeamMember }>("/api/v1/portal/team", input).then((r) => r.member);
export const updateMember = (userId: string, patch: { roles?: string[]; status?: "active" | "disabled"; name?: string }) =>
  apiSend<{ member: TeamMember }>("PATCH", `/api/v1/portal/team/${userId}`, patch).then((r) => r.member);
export const reinviteMember = (userId: string) => apiPost<{ ok: boolean }>(`/api/v1/portal/team/${userId}/reinvite`);

// ---------- Empresa ----------
export interface CompanyProfile {
  companyId: string;
  name: string;
  country?: string | null;
  logoUrl: string | null;
}
export const getCompany = () => apiGet<{ company: CompanyProfile }>("/api/v1/portal/company").then((r) => r.company);
export async function uploadCompanyLogo(file: File): Promise<CompanyProfile> {
  const { key, uploadUrl } = await apiPost<{ key: string; uploadUrl: string }>("/api/v1/portal/company/logo", { contentType: file.type, size: file.size });
  const put = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
  if (!put.ok) throw new ApiError(put.status, "UPLOAD_FAILED", "No se pudo subir el logo.");
  return apiPut<{ company: CompanyProfile }>("/api/v1/portal/company", { logoKey: key }).then((r) => r.company);
}

// ---------- Agentes ----------
export interface CompanyAgent {
  version: number;
  instructions: string;
  mandatory: string[];
  configurable: string[];
  updatedAt: string;
  updatedBy: Actor;
  history: { version: number; at: string; by: string }[];
}
export interface CatalogAgent {
  id: string;
  name: string;
  layer: string | null;
  pattern: string | null;
  description: string;
  what: string;
  how: string;
  stage: string | null;
  executable: boolean;
  kind: "base" | "platform" | "optional" | "framework";
  responsibilities: string[];
  forbiddenActions: string[];
  allowedTools: string[];
  mcpServers: string[];
  qualityGates: string[];
  definitionPath: string | null;
  prompt: string;
  company: CompanyAgent | null;
}
export interface AgentCatalog {
  framework: { sha?: string; branch?: string };
  baseNodes: string[];
  optionalAgents: string[];
  agents: CatalogAgent[];
  canDefine: boolean;
}
let catalogCache: { at: number; value: Promise<AgentCatalog> } | null = null;
export function listAgents(fresh = false): Promise<AgentCatalog> {
  if (fresh || !catalogCache || Date.now() - catalogCache.at > 60_000) {
    catalogCache = { at: Date.now(), value: apiGet<AgentCatalog>("/api/v1/portal/agents") };
    catalogCache.value.catch(() => (catalogCache = null));
  }
  return catalogCache.value;
}
export const defineAgent = (agentId: string, input: { instructions: string; mandatory: string[]; configurable: string[] }) =>
  apiPut<{ company: CompanyAgent }>(`/api/v1/portal/agents/${agentId}`, input).then((r) => {
    catalogCache = null;
    return r.company;
  });

// ---------- Flujos ----------
export interface FlowTemplate {
  flowId: string;
  name: string;
  description: string;
  agents: string[];
  version: number;
  createdBy: Actor;
  updatedAt: string;
  updatedBy: Actor;
}
export const listFlows = () => apiGet<{ flows: FlowTemplate[]; canManage: boolean }>("/api/v1/portal/flows");
export const saveFlow = (input: { name: string; description: string; agents: string[] }, flowId?: string) =>
  (flowId ? apiPut<{ flow: FlowTemplate }>(`/api/v1/portal/flows/${flowId}`, input) : apiPost<{ flow: FlowTemplate }>("/api/v1/portal/flows", input)).then((r) => r.flow);
export const archiveFlow = (flowId: string) => apiSend<{ ok: boolean }>("DELETE", `/api/v1/portal/flows/${flowId}`);

// ---------- Conectores y gobierno ----------
export interface ConnectorsInfo {
  engine: { ok: boolean; provider?: string; model?: string; keyUpdatedAt?: string };
  apps: {
    app: { id: string; name: string; url: string };
    github: { ok: boolean; account?: string; repos?: string[]; permissions?: Record<string, string>; error?: string };
    cloud: { provider: string; role?: string; environment: string; lastVerified: { at?: string; requestId: string } | null };
  }[];
}
export const getConnectors = () => apiGet<ConnectorsInfo>("/api/v1/portal/connectors");

export interface GovernanceInfo {
  policies: string[];
  approvalModel: { policy: string; gates: { id: string; required?: boolean; required_when?: string; owner?: string }[]; invariants: string[] };
  framework: { sha?: string; branch?: string };
  audit: { at: string; by: Actor; action: string; detail: Record<string, unknown> }[];
  usage: { requests: number; byStatus: Record<string, number>; costUsd: number; costNote: string; byRequest?: { requestId: string; title: string; status: string; usd: number; estimated: boolean }[] };
}
export const getGovernance = () => apiGet<GovernanceInfo>("/api/v1/portal/governance");
