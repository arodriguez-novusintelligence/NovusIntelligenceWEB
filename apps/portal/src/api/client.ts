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

export async function apiGet<T>(path: string): Promise<T> {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();
  if (!token) {
    throw new ApiError(401, "NO_SESSION", "Tu sesión terminó. Vuelve a ingresar.");
  }
  const res = await fetch(`${config.apiUrl}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = (await res.json().catch(() => ({}))) as { code?: string; message?: string };
  if (!res.ok) {
    throw new ApiError(res.status, body.code ?? "HTTP_ERROR", body.message ?? "No pudimos comunicarnos con NADF.");
  }
  return body as T;
}

export interface Me {
  user: { id: string; email: string; name: string | null; roles: string[]; mfaRequired: boolean };
  company: { id: string; name: string; country: string | null };
  permissions: Permission[];
}

export function getMe(): Promise<Me> {
  return apiGet<Me>("/api/v1/portal/me");
}
