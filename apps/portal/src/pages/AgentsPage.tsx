import { useEffect, useMemo, useState } from "react";
import { BookOpen, Building2, Loader2 } from "lucide-react";
import { listAgents, type AgentCatalog, type CatalogAgent } from "@/api/admin";
import { ApiError, type Me } from "@/api/client";
import { AgentDefinitionDialog } from "@/components/agents/AgentDefinitionDialog";
import { cn } from "@/lib/cn";

const KIND_LABEL: Record<CatalogAgent["kind"], string> = {
  base: "Flujo base (siempre)",
  platform: "Control de la plataforma (siempre)",
  optional: "Opcional en los flujos",
  framework: "Definido en el framework",
};

/** Catálogo de agentes: qué hace y cómo funciona cada uno, con su definición y los ajustes de la empresa. */
export function AgentsPage({ me }: { me: Me }) {
  const [catalog, setCatalog] = useState<AgentCatalog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [filter, setFilter] = useState<"executable" | "all">("executable");

  const load = () =>
    listAgents(true)
      .then(setCatalog)
      .catch((e) => setError(e instanceof ApiError ? e.message : "No se pudo cargar el catálogo."));
  useEffect(() => void load(), []);

  const groups = useMemo(() => {
    const list = (catalog?.agents ?? []).filter((a) => filter === "all" || a.executable);
    const order: CatalogAgent["kind"][] = ["base", "optional", "platform", "framework"];
    return order.map((k) => ({ kind: k, agents: list.filter((a) => a.kind === k) })).filter((g) => g.agents.length);
  }, [catalog, filter]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="space-y-2 pt-2">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-secondary">Agentes</p>
        <h1 className="text-3xl font-semibold">Los agentes de NADF</h1>
        <p className="text-muted-foreground">
          Qué hace y cómo funciona cada agente. La definición viene del framework NADF ({catalog?.framework.branch}@{catalog?.framework.sha?.slice(0, 7)}); {me.company.name} puede sumar instrucciones y reglas propias
          {catalog?.canDefine ? " (tienes permiso para editarlas)." : " (las edita un Arquitecto o un Admin)."}
        </p>
        <div className="flex gap-1 text-xs" role="group" aria-label="Filtro">
          <button type="button" onClick={() => setFilter("executable")} className={cn("chip", filter === "executable" && "border-secondary/60 text-foreground")}>
            Disponibles en el portal
          </button>
          <button type="button" onClick={() => setFilter("all")} className={cn("chip", filter === "all" && "border-secondary/60 text-foreground")}>
            Todos los del framework ({catalog?.agents.length ?? "…"})
          </button>
        </div>
      </section>
      {error && <p className="text-sm text-bad">{error}</p>}
      {!catalog && !error && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Cargando…
        </p>
      )}
      {groups.map((g) => (
        <section key={g.kind} className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">{KIND_LABEL[g.kind]}</h2>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {g.agents.map((a) => (
              <article key={a.id} className={cn("glass flex flex-col gap-2 p-4", !a.executable && "opacity-70")}>
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold">{a.name}</h3>
                    <p className="truncate font-mono text-[11px] text-muted-foreground">
                      {a.id}
                      {a.stage ? ` · ${a.stage}` : ""}
                    </p>
                  </div>
                  {a.company && (
                    <span className="chip px-2 py-0.5 text-[11px] text-secondary" title="Ajustado para la empresa">
                      <Building2 className="h-3 w-3" aria-hidden="true" /> v{a.company.version}
                    </span>
                  )}
                </div>
                <p className="text-sm">
                  <span className="text-muted-foreground">Qué hace: </span>
                  {a.what}
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Cómo funciona: </span>
                  {a.how}
                </p>
                <button type="button" className="btn-ghost mt-auto self-start px-3 py-1.5 text-xs" onClick={() => setOpen(a.id)}>
                  <BookOpen className="h-3.5 w-3.5" aria-hidden="true" /> Ver definición
                </button>
              </article>
            ))}
          </div>
        </section>
      ))}
      {open && (
        <AgentDefinitionDialog
          agentId={open}
          companyName={me.company.name}
          onClose={() => {
            setOpen(null);
            void load();
          }}
        />
      )}
    </div>
  );
}
