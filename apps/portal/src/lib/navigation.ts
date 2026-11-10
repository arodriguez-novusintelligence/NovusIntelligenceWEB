/** Permisos que entrega GET /api/v1/portal/me (fuente de verdad: el backend). */
export type Permission =
  | "platform.companies"
  | "company.manage"
  | "users.manage"
  | "apps.manage"
  | "connectors.manage"
  | "agents.manage"
  | "requests.create"
  | "requests.submit"
  | "reports.view"
  | "reports.viewOwn"
  | "approvals.decide"
  | "deployments.view"
  | "deployments.operate"
  | "audit.view"
  | "usage.view";

/** Fase de implementación actual del plan (documento de diseño NADF). */
export const CURRENT_PHASE = 0;

export type NavIcon = "command" | "requests" | "approvals" | "connectors" | "agents" | "team" | "governance" | "security";

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: NavIcon;
  /** Fase del plan en la que la vista se habilita. */
  phase: number;
  /** Se muestra si el usuario tiene AL MENOS uno de estos permisos; vacío = todos. */
  anyOf: Permission[];
}

export const NAV_ITEMS: NavItem[] = [
  { id: "command", label: "Centro de mando", path: "/", icon: "command", phase: 0, anyOf: [] },
  { id: "requests", label: "Solicitudes", path: "/solicitudes", icon: "requests", phase: 2, anyOf: ["requests.create", "reports.view", "reports.viewOwn"] },
  { id: "approvals", label: "Aprobaciones", path: "/aprobaciones", icon: "approvals", phase: 4, anyOf: ["approvals.decide"] },
  { id: "connectors", label: "Conectores", path: "/conectores", icon: "connectors", phase: 1, anyOf: ["connectors.manage"] },
  { id: "agents", label: "Agentes", path: "/agentes", icon: "agents", phase: 1, anyOf: ["agents.manage"] },
  { id: "team", label: "Equipo", path: "/equipo", icon: "team", phase: 1, anyOf: ["users.manage"] },
  { id: "governance", label: "Gobierno", path: "/gobierno", icon: "governance", phase: 1, anyOf: ["audit.view"] },
  { id: "security", label: "Seguridad", path: "/seguridad", icon: "security", phase: 0, anyOf: [] },
];

export interface VisibleNavItem extends NavItem {
  available: boolean;
}

export function visibleNav(permissions: readonly Permission[], phase: number = CURRENT_PHASE): VisibleNavItem[] {
  return NAV_ITEMS.filter((item) => item.anyOf.length === 0 || item.anyOf.some((p) => permissions.includes(p))).map(
    (item) => ({ ...item, available: item.phase <= phase }),
  );
}

export const ROLE_LABELS: Record<string, string> = {
  "novus-admin": "Admin Novus",
  admin: "Admin",
  aprobador: "Aprobador",
  funcional: "Funcional",
  desarrollador: "Desarrollador",
  observador: "Observador",
};

/** Sugerencias para la barra de mando según lo que el usuario puede hacer. */
export function commandSuggestions(permissions: readonly Permission[]): string[] {
  const out: string[] = [];
  if (permissions.includes("requests.create")) out.push("Quiero que el checkout muestre el total con IVA");
  if (permissions.includes("connectors.manage")) out.push("Conecta nuestro GitHub");
  if (permissions.includes("users.manage")) out.push("Invita a María como aprobadora");
  if (permissions.includes("approvals.decide")) out.push("¿Qué está pendiente de aprobar?");
  if (out.length === 0) out.push("¿Qué solicitudes están en curso?");
  return out.slice(0, 3);
}
