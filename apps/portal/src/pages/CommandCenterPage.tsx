import { Link } from "react-router-dom";
import { Inbox, Plug, ShieldAlert, ShieldCheck } from "lucide-react";
import type { Me } from "@/api/client";
import { AgentAvatar } from "@/components/AgentAvatar";
import { CommandBar } from "@/components/CommandBar";
import { cn } from "@/lib/cn";
import { CURRENT_PHASE, ROLE_LABELS, commandSuggestions } from "@/lib/navigation";

/** Agentes de NADF (docs/multiagent-architecture del framework). Sin solicitudes en curso, todos esperan. */
const AGENTS = [
  { name: "Orquestador", initials: "OR" },
  { name: "Analista", initials: "AN" },
  { name: "Arquitecto", initials: "AR" },
  { name: "Desarrollador", initials: "DV" },
  { name: "QA", initials: "QA" },
  { name: "Seguridad", initials: "SG" },
  { name: "Release", initials: "RL" },
];

const PHASES = ["Base", "Acceso y conectores", "Solicitudes", "Desarrollo y pruebas", "Aprobación y PROD", "Piloto", "NADF en todas partes"];

function firstName(me: Me): string {
  const source = me.user.name ?? me.user.email.split("@")[0];
  return source.split(" ")[0];
}

export function CommandCenterPage({ me, mfaEnabled }: { me: Me; mfaEnabled: boolean }) {
  const needsMfa = me.user.mfaRequired && !mfaEnabled;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="animate-nadf-rise space-y-2 pt-2">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-secondary">Centro de mando</p>
        <h1 className="text-3xl font-semibold sm:text-4xl">
          Hola, <span className="ai-gradient-text">{firstName(me)}</span>.
        </h1>
        <p className="text-muted-foreground">Desde aquí diriges a los agentes de IA de {me.company.name}.</p>
      </section>

      <CommandBar suggestions={commandSuggestions(me.permissions)} />

      {needsMfa && (
        <div className="glass flex flex-col gap-3 border-warn/40 p-4 sm:flex-row sm:items-center" role="alert">
          <ShieldAlert className="h-6 w-6 shrink-0 text-warn" aria-hidden="true" />
          <div className="flex-1 text-sm">
            <p className="font-medium text-foreground">Activa la verificación en dos pasos</p>
            <p className="text-muted-foreground">Tu rol aprueba o administra. Las aprobaciones a producción la exigirán.</p>
          </div>
          <Link to="/seguridad" className="btn-primary">
            Activar ahora
          </Link>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="glass p-5 lg:col-span-2" aria-labelledby="agents-title">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="agents-title" className="text-lg font-semibold">
              Agentes NADF
            </h2>
            <span className="chip">Sin solicitudes en curso</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {AGENTS.map((a) => (
              <AgentAvatar key={a.name} name={a.name} initials={a.initials} state="idle" />
            ))}
          </div>
        </section>

        <section className="glass p-5" aria-labelledby="waiting-title">
          <h2 id="waiting-title" className="mb-4 text-lg font-semibold">
            Espera por ti
          </h2>
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <Inbox className="h-5 w-5 shrink-0" aria-hidden="true" />
            <p>Nada pendiente. Aquí aparecerán las preguntas del agente y las aprobaciones que te correspondan.</p>
          </div>
        </section>

        <section className="glass p-5" aria-labelledby="access-title">
          <h2 id="access-title" className="mb-3 text-lg font-semibold">
            Tu acceso
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {me.user.roles.map((r) => (
              <span key={r} className="chip">
                {ROLE_LABELS[r] ?? r}
              </span>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{me.permissions.length} permisos activos en {me.company.name}.</p>
          <Link to="/seguridad" className="mt-3 inline-flex items-center gap-1.5 text-sm text-foreground/90 hover:text-foreground">
            <ShieldCheck className={cn("h-4 w-4", mfaEnabled ? "text-good" : "text-warn")} aria-hidden="true" />
            {mfaEnabled ? "Verificación en dos pasos activa" : "Verificación en dos pasos inactiva"}
          </Link>
        </section>

        <section className="glass p-5" aria-labelledby="connectors-title">
          <h2 id="connectors-title" className="mb-3 text-lg font-semibold">
            Conectores
          </h2>
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <Plug className="h-5 w-5 shrink-0" aria-hidden="true" />
            <p>Aún no hay sistemas conectados. En la fase 1 conectarás GitHub, tu nube y tus herramientas por MCP.</p>
          </div>
        </section>

        <section className="glass p-5" aria-labelledby="plan-title">
          <h2 id="plan-title" className="mb-3 text-lg font-semibold">
            Plan de NADF
          </h2>
          <ol className="space-y-2">
            {PHASES.map((label, index) => (
              <li key={label} className="flex items-center gap-3 text-sm">
                <span
                  className={cn(
                    "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[11px]",
                    index < CURRENT_PHASE && "bg-good/20 text-good",
                    index === CURRENT_PHASE && "bg-gradient-to-br from-primary to-secondary text-white shadow-glow-secondary",
                    index > CURRENT_PHASE && "border border-white/15 text-muted-foreground",
                  )}
                >
                  {index}
                </span>
                <span className={index === CURRENT_PHASE ? "text-foreground" : "text-muted-foreground"}>{label}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
