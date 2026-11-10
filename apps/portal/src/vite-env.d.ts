/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NADF_REGION: string;
  readonly VITE_NADF_USER_POOL_ID: string;
  readonly VITE_NADF_USER_POOL_CLIENT_ID: string;
  readonly VITE_NADF_API_URL: string;
  readonly VITE_NADF_STAGE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
