import { useEffect, useState } from "react";
import { Building2, Loader2, Lock, Plus, Save, Trash2, X } from "lucide-react";
import { defineAgent, listAgents, type AgentCatalog, type CatalogAgent } from "@/api/admin";
import { ApiError } from "@/api/client";
import { cn } from "@/lib/cn";

function ListEditor({ label, items, onChange, editable }: { label: string; items: string[]; onChange: (v: string[]) => void; editable: boolean }) {
  return (
    <section className="space-y-1.5">
      <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</h4>
      {items.length === 0 && !editable && <p className="text-sm text-muted-foreground">—</p>}
      <ul className="space-y-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex gap-1.5">
            {editable ? (
              <>
                <input className="field py-1.5 text-sm" value={it} maxLength={300} aria-label={`${label} ${i + 1}`} onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))} />
                <button type="button" className="btn-ghost px-2" aria-label="Quitar" onClick={() => onChange(items.filter((_, j) => j !== i))}>
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </>
            ) : (
              <span className="w-full rounded-lg border border-white/10 px-2.5 py-1.5 text-sm">{it}</span>
            )}
          </li>
        ))}
      </ul>
      {editable && (
        <button type="button" className="btn-ghost px-2.5 py-1 text-xs" onClick={() => onChange([...items, ""])} disabled={items.length >= 20}>
          <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Agregar
        </button>
      )}
    </section>
  );
}

function Chips({ label, items }: { label: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <section className="space-y-1.5">
      <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</h4>
      <div className="flex flex-wrap gap-1.5">
        {items.map((x) => (
          <span key={x} className="chip font-mono text-[11px]">
            {x}
          </span>
        ))}
      </div>
    </section>
  );
}

/**
 * Definición de un agente: lo que define el framework NADF (solo lectura) y los ajustes de ESTA empresa
 * (editables por Arquitecto o Admin). Los ajustes nunca cambian el NADF global; aplican a solicitudes nuevas.
 */
export function AgentDefinitionDialog({ agentId, companyName, onClose }: { agentId: string; companyName: string; onClose: () => void }) {
  const [catalog, setCatalog] = useState<AgentCatalog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [instructions, setInstructions] = useState("");
  const [mandatory, setMandatory] = useState<string[]>([]);
  const [configurable, setConfigurable] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState<number | null>(null);

  useEffect(() => {
    listAgents()
      .then((c) => {
        setCatalog(c);
        const a = c.agents.find((x) => x.id === agentId);
        setInstructions(a?.company?.instructions ?? "");
        setMandatory(a?.company?.mandatory ?? []);
        setConfigurable(a?.company?.configurable ?? []);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "No se pudo cargar la definición."));
  }, [agentId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const agent: CatalogAgent | undefined = catalog?.agents.find((x) => x.id === agentId);
  const editable = Boolean(catalog?.canDefine) && Boolean(agent);

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const c = await defineAgent(agentId, { instructions, mandatory: mandatory.map((m) => m.trim()).filter(Boolean), configurable: configurable.map((m) => m.trim()).filter(Boolean) });
      setSaved(c.version);
      setCatalog(await listAgents(true));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo guardar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`Definición de ${agent?.name ?? agentId}`}>
      <div className="glass-strong my-6 w-full max-w-3xl space-y-5 p-5">
        <header className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-secondary">Definición del agente</p>
            <h2 className="text-xl font-semibold">{agent?.name ?? agentId}</h2>
            <p className="font-mono text-xs text-muted-foreground">
              {agentId}
              {agent?.stage ? ` · ${agent.stage}` : ""}
              {agent?.pattern ? ` · ${agent.pattern}` : ""}
            </p>
          </div>
          <button type="button" className="btn-ghost px-2 py-1.5" aria-label="Cerrar" onClick={onClose}>
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </header>

        {!catalog && !error && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Cargando…
          </p>
        )}
        {error && <p className="text-sm text-bad" role="alert">{error}</p>}

        {agent && (
          <>
            <section className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 p-3">
                <h3 className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">Qué hace</h3>
                <p className="text-sm">{agent.what}</p>
              </div>
              <div className="rounded-xl border border-white/10 p-3">
                <h3 className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">Cómo funciona</h3>
                <p className="text-sm">{agent.how}</p>
              </div>
            </section>
            {!agent.executable && <p className="rounded-xl border border-warn/40 bg-warn/[0.06] p-3 text-sm text-warn">Este agente existe en el framework, pero el ejecutor del portal todavía no lo ejecuta.</p>}

            <section className="space-y-3 rounded-xl border border-white/10 p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Lock className="h-4 w-4 text-muted-foreground" aria-hidden="true" /> Definición del framework NADF (solo lectura)
              </h3>
              <p className="text-xs text-muted-foreground">
                {agent.definitionPath ?? "Paso de la plataforma"} · {catalog?.framework.branch}@{catalog?.framework.sha?.slice(0, 7)}. No se edita desde el portal: es común a todas las empresas.
              </p>
              <Chips label="Responsabilidades" items={agent.responsibilities} />
              <Chips label="Acciones prohibidas (obligatorias)" items={agent.forbiddenActions} />
              <Chips label="Herramientas permitidas" items={agent.allowedTools} />
              <Chips label="Servidores MCP" items={agent.mcpServers} />
              <Chips label="Quality gates" items={agent.qualityGates} />
              {agent.prompt && (
                <details>
                  <summary className="cursor-pointer select-none text-sm">Ver prompt del agente</summary>
                  <pre className="mt-2 max-h-[320px] overflow-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-black/30 p-3 font-mono text-[11.5px]">{agent.prompt}</pre>
                </details>
              )}
            </section>

            <section className={cn("space-y-3 rounded-xl border p-4", editable ? "border-secondary/40" : "border-white/10")}>
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Building2 className="h-4 w-4 text-secondary" aria-hidden="true" /> Ajustes de {companyName}
                {agent.company && <span className="chip py-0.5 text-[11px]">v{agent.company.version}</span>}
              </h3>
              <p className="text-xs text-muted-foreground">
                Solo afectan a {companyName}; el NADF global no cambia. Se aplican a las solicitudes nuevas (las que ya se ejecutaron conservan su versión).
                {!editable && " Solo un Arquitecto o un Admin pueden editarlos."}
              </p>
              <section className="space-y-1.5">
                <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Instrucciones adicionales para el agente</h4>
                {editable ? (
                  <textarea className="field min-h-[96px] text-sm" value={instructions} maxLength={4000} onChange={(e) => setInstructions(e.target.value)} placeholder="Ej.: usa los tokens de color del manual de marca de la empresa." />
                ) : (
                  <p className="whitespace-pre-wrap text-sm">{instructions || "—"}</p>
                )}
              </section>
              <ListEditor label="Reglas obligatorias de la empresa" items={mandatory} onChange={setMandatory} editable={editable} />
              <ListEditor label="Reglas configurables por defecto" items={configurable} onChange={setConfigurable} editable={editable} />
              {editable && (
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" className="btn-primary" disabled={busy} onClick={() => void save()}>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />} Guardar versión {(agent.company?.version ?? 0) + 1}
                  </button>
                  {saved && <span className="text-sm text-good">Guardado como versión {saved}.</span>}
                </div>
              )}
              {agent.company?.history?.length ? (
                <details className="text-xs text-muted-foreground">
                  <summary className="cursor-pointer select-none">Historial ({agent.company.history.length})</summary>
                  <ul className="mt-1 space-y-0.5">
                    {agent.company.history.map((h) => (
                      <li key={h.version}>
                        v{h.version} · {h.by} · {new Date(h.at).toLocaleString("es-CO")}
                      </li>
                    ))}
                  </ul>
                </details>
              ) : null}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
