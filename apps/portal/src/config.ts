export const config = {
  region: import.meta.env.VITE_NADF_REGION || "sa-east-1",
  userPoolId: import.meta.env.VITE_NADF_USER_POOL_ID,
  userPoolClientId: import.meta.env.VITE_NADF_USER_POOL_CLIENT_ID,
  apiUrl: (import.meta.env.VITE_NADF_API_URL || "").replace(/\/$/, ""),
  stage: import.meta.env.VITE_NADF_STAGE || "dev",
};

export function missingConfig(): string[] {
  const missing: string[] = [];
  if (!config.userPoolId) missing.push("VITE_NADF_USER_POOL_ID");
  if (!config.userPoolClientId) missing.push("VITE_NADF_USER_POOL_CLIENT_ID");
  if (!config.apiUrl) missing.push("VITE_NADF_API_URL");
  return missing;
}
