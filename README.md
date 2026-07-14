# NovusIntelligenceWEB

Repositorio productivo del piloto **novus-intelligence** (NADF).

Frontend **React + TypeScript + Tailwind + Vite + React Router**.

## Desarrollo local

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Variables de entorno

Copia `.env.example` a `.env.local` y configura:

| Variable | Descripción |
|----------|-------------|
| `VITE_NOVUS_API_URL` | URL base de la API (ej. `https://api-dev.novusintelligence.com`) |
| `VITE_DEMO_MODE` | Debe ser `false` en builds productivos |

## Rutas

| Ruta | Página |
|------|--------|
| `/` | Landing |
| `/services` | Servicios |
| `/solutions` | Catálogo soluciones |
| `/solutions/:slug` | Detalle solución (6 slugs) |
| `/about` | Nosotros |
| `/cases` | Casos de éxito |
| `/contact` | Formulario contacto |
| `/privacy` | Privacidad |
| `/data-treatment` | Tratamiento datos |
| `/terms` | Términos |

## NADF

Implementado por **frontend-integration-agent** según plan aprobado. Sin copia de código Lovable.
