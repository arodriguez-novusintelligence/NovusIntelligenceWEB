import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Inbox, Loader2 } from "lucide-react";
import { ApiError, listRequests, type Me, type RequestSummary } from "@/api/client";
import { CommandBar } from "@/components/CommandBar";
import { StatusBadge } from "@/components/pipeline/StatusBadge";
import { commandSuggestions } from "@/lib/navigation";
import { isActive, timeAgo } from "@/lib/pipeline";

export function RequestsPage({ me, onlyApprovals = false }: { me: Me; onlyApprovals?: boolean }) {
  const [items, setItems] = useState<RequestSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let stopped = false;
    const tick = async () => {
      try {
        const list = await listRequests();
        if (stopped) return;
        setItems(list);
        setError(null);
        timer = setTimeout(tick, list.some((r) => isActive(r.status)) ? 4000 : 20000);
      } catch (e) {
        if (!stopped) setError(e instanceof ApiError ? e.message : "No pudimos cargar las solicitudes.");
      }
    };
    void tick();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, []);

  const shown = (items ?? []).filter((r) => !onlyApprovals || r.status === "awaiting_approval");

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="space-y-2 pt-2">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-secondary">{onlyApprovals ? "Aprobaciones" : "Solicitudes"}</p>
        <h1 className="text-3xl font-semibold">{onlyApprovals ? "Esperan tu aprobación para PROD" : "Lo que la IA está construyendo"}</h1>
        <p className="text-muted-foreground">
          {onlyApprovals
            ? "Cada cambio trae su vista previa, el informe del agente y las pruebas. Nada llega a producción sin tu aprobación."
            : "Cada pedido pasa por desarrollo, pruebas y una vista previa; luego un aprobador decide si va a producción."}
        </p>
      </section>

      {!onlyApprovals && me.permissions.includes("requests.create") && <CommandBar suggestions={commandSuggestions(me.permissions)} />}

      {error && <p className="text-sm text-bad">{error}</p>}
      {!items && !error && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Cargando…
        </p>
      )}
      {items && shown.length === 0 && (
        <div className="glass flex items-center gap-3 p-5 text-sm text-muted-foreground">
          <Inbox className="h-5 w-5" aria-hidden="true" />
          {onlyApprovals ? "No hay despliegues esperando aprobación." : "Todavía no hay solicitudes. Escribe arriba lo que necesitas."}
        </div>
      )}
      <ul className="space-y-2">
        {shown.map((r) => (
          <li key={r.requestId}>
            <Link to={`/solicitudes/${r.requestId}`} className="glass flex items-center gap-4 p-4 transition hover:border-white/25 hover:bg-white/[0.06]">
              <div className="min-w-0 flex-1 space-y-1">
                <p className="truncate font-medium">{r.title}</p>
                <p className="text-xs text-muted-foreground">
                  {r.createdBy.name ?? r.createdBy.email} · {timeAgo(r.updatedAt)}
                  {r.iteration > 1 ? ` · iteración ${r.iteration}` : ""}
                </p>
              </div>
              <StatusBadge status={r.status} />
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
