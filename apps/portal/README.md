# NADF — Administrador de IA (portal)

Frontend de **portal.novusintelligencesolutions.com**: el centro de mando de IA donde cada empresa organiza y controla su desarrollo con agentes (diseño: documento "NADF — Administrador de IA").

Es un workspace independiente de la web corporativa (raíz del repo): el build y el deploy de la web no cambian.

## Fase 0 (este código)

- Acceso solo por invitación (Cognito): primer ingreso con contraseña temporal, cambio obligatorio, recuperación por correo y verificación en dos pasos (TOTP) con QR.
- Centro de mando: barra de mando, agentes NADF, lo que espera por ti, acceso y roles, conectores y plan por fases.
- Navegación según los permisos que devuelve `GET /api/v1/portal/me`; las vistas de fases futuras aparecen deshabilitadas.
- La barra de mando aún no ejecuta pedidos: el asistente NADF llega en la fase 1 y la UI lo dice explícitamente.

## Desarrollo

```bash
cp apps/portal/.env.example apps/portal/.env.local   # completar con las salidas del stack nadf-portal-dev
npm install                                          # desde la raíz (workspaces)
npm run portal:dev                                   # http://localhost:5174
npm run portal:test                                  # pruebas unitarias (vitest)
```

## Despliegue

Requiere AWS CLI con credenciales y el stack `nadf-portal-{stage}` desplegado desde NovusIntelligenceBack (`serverless-portal.yml`).

```bash
cd apps/portal
node scripts/deploy.mjs --stage dev
```

El script toma de las salidas del stack el User Pool, el cliente, la URL de la API, el bucket y la distribución; compila, sube a S3 (assets con caché inmutable, `index.html` sin caché) e invalida CloudFront.

## Variables (`VITE_*`)

| Variable | Origen |
| --- | --- |
| `VITE_NADF_REGION` | Región del stack (sa-east-1) |
| `VITE_NADF_USER_POOL_ID` | Salida `UserPoolId` |
| `VITE_NADF_USER_POOL_CLIENT_ID` | Salida `UserPoolClientId` |
| `VITE_NADF_API_URL` | Salida `HttpApiUrl` |
| `VITE_NADF_STAGE` | `dev` / `prod` (muestra la etiqueta de entorno) |

Son identificadores públicos; no hay secretos en el frontend.
