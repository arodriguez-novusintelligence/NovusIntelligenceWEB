import { useCallback, useEffect, useMemo, useState } from "react";
import { Archive, BookOpen, GripVertical, Loader2, Lock, Minus, Plus, Save, Workflow as FlowIcon } from "lucide-react";
import { archiveFlow, listAgents, listFlows, saveFlow, type AgentCatalog, type CatalogAgent, type FlowTemplate } from "@/api/admin";
import { ApiError, type Me } from "@/api/client";
import { AgentDefinitionDialog } from "@/components/agents/AgentDefinitionDialog";
import { WorkflowCanvas } from "@/components/studio/WorkflowCanvas";
import { cn } from "@/lib/cn";
import { BASE, OPTIONAL, flowPreview, normalizeSelection } from "@/lib/flows";

function PaletteItem({ agent, state, onToggle, onInfo, canEdit }: { agent: CatalogAgent; state: "base" | "platform" | "on" | "off" | "unavailable"; onToggle?: () => void; onInfo: () => void; canEdit: boolean }) {
  const draggable = canEdit && state === "off";
  return (
    <li
      draggable={draggable}
      onDragStart={(e) => e.dataTransfer.setData("text/nadf-agent", agent.id)}
      className={cn(
        "rounded-xl border p-2.5 text-sm",
        state === "on" && "border-secondary/60 bg-secondary/10",
        state === "off" && "border-white/10 hover:border-white/25",
        (state === "base" || state === "platform") && "border-white/10 bg-white/[0.03]",
        state === "unavailable" && "border-dashed border-white/10 opacity-55",
        draggable && "cursor-grab",
      )}
    >
      <div className="flex items-start gap-2">
        {draggable ? <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" /> : (state === "base" || state === "platform") && <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />}
        <div className="min-w-0 flex-1">
          <p className="font-medium">{agent.name}</p>
          <p className="text-xs text-muted-foreground">{agent.what}</p>
          <p className="mt-1 text-[11px] text-muted-foreground/80">
            {state === "base" ? "Flujo base: siempre incluido." : state === "platform" ? "Control de la plataforma: siempre incluido." : state === "unavailable" ? "Aún no lo ejecuta el portal." : agent.how}
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-1">
          <button type="button" className="btn-ghost px-1.5 py-1" title="Ver definición" aria-label={`Ver definición de ${agent.name}`} onClick={onInfo}>
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          {canEdit && (state === "on" || state === "off") && (
            <button type="button" className="btn-ghost px-1.5 py-1" aria-label={state === "on" ? `Quitar ${agent.name}` : `Agregar ${agent.name}`} onClick={onToggle}>
              {state === "on" ? <Minus className="h-3.5 w-3.5" aria-hidden="true" /> : <Plus className="h-3.5 w-3.5" aria-hidden="true" />}
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

/** Flujos de la empresa: un Desarrollador (o Arquitecto/Admin) arma flujos a partir de los agentes disponibles. */
export function FlowsPage({ me }: { me: Me }) {
  const [flows, setFlows] = useState<FlowTemplate[] | null>(null);
  const [canManage, setCanManage] = useState(false);
  const [catalog, setCatalog] = useState<AgentCatalog | null>(null);
  const [editing, setEditing] = useState<FlowTemplate | "new" | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [over, setOver] = useState(false);

  const load = useCallback(async () => {
    try {
      const [f, c] = await Promise.all([listFlows(), listAgents()]);
      setFlows(f.flows);
      setCanManage(f.canManage);
      setCatalog(c);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudieron cargar los flujos.");
    }
  }, []);
  useEffect(() => void load(), [load]);

  function open(f: FlowTemplate | "new") {
    setEditing(f);
    setName(f === "new" ? "" : f.name);
    setDescription(f === "new" ? "" : f.description);
    setSelected(f === "new" ? [] : normalizeSelection(f.agents));
    setNotice(null);
    setError(null);
  }

  const preview = useMemo(() => flowPreview(selected), [selected]);
  const add = (id: string) => OPTIONAL.includes(id) && setSelected((s) => normalizeSelection([...s, id]));
  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : normalizeSelection([...s, id])));
  const stateOf = (a: CatalogAgent): "base" | "platform" | "on" | "off" | "unavailable" =>
    BASE.includes(a.id) ? "base" : a.kind === "platform" ? "platform" : OPTIONAL.includes(a.id) ? (selected.includes(a.id) ? "on" : "off") : "unavailable";

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const flow = await saveFlow({ name, description, agents: selected }, editing && editing !== "new" ? editing.flowId : undefined);
      setNotice(`Flujo «${flow.name}» guardado (versión ${flow.version}). Ya se puede elegir al crear una solicitud.`);
      setEditing(flow);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo guardar el flujo.");
    } finally {
      setBusy(false);
    }
  }

  const palette = (catalog?.agents ?? []).filter((a) => a.kind !== "framework" || a.id.endsWith("-agent"));
  const groups: [string, CatalogAgent[]][] = [
    ["Flujo base", palette.filter((a) => BASE.includes(a.id))],
    ["Agentes que puedes agregar", palette.filter((a) => OPTIONAL.includes(a.id))],
    ["Controles de la plataforma", palette.filter((a) => a.kind === "platform" && !BASE.includes(a.id))],
    ["Otros agentes del framework", palette.filter((a) => a.kind === "framework")],
  ];

  return (
    <div className="mx-auto max-w-[1500px] space-y-5">
      <section className="space-y-2 pt-2">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-secondary">Flujos</p>
        <h1 className="text-3xl font-semibold">Flujos de {me.company.name}</h1>
        <p className="text-muted-foreground">
          Un flujo define qué agentes trabajan en una solicitud. Si no eliges flujo, NADF decide con el Complexity Router. Los pasos base y los controles de seguridad siempre se incluyen.
        </p>
      </section>
      {error && <p className="text-sm text-bad" role="alert">{error}</p>}
      {notice && <p className="text-sm text-good" role="status">{notice}</p>}

      {!editing && (
        <div className="space-y-3">
          {canManage && (
            <button type="button" className="btn-primary" onClick={() => open("new")}>
              <Plus className="h-4 w-4" aria-hidden="true" /> Crear flujo
            </button>
          )}
          {!flows ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Cargando…
            </p>
          ) : flows.length === 0 ? (
            <div className="glass p-5 text-sm text-muted-foreground">Todavía no hay flujos propios. Las solicitudes usan el flujo automático de NADF.</div>
          ) : (
            <ul className="grid gap-3 md:grid-cols-2">
              {flows.map((f) => (
                <li key={f.flowId} className="glass space-y-2 p-4">
                  <div className="flex items-start gap-2">
                    <FlowIcon className="mt-0.5 h-5 w-5 text-secondary" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{f.name}</p>
                      <p className="text-xs text-muted-foreground">
                        v{f.version} · {f.updatedBy.name ?? f.updatedBy.email}
                      </p>
                    </div>
                  </div>
                  {f.description && <p className="text-sm text-muted-foreground">{f.description}</p>}
                  <p className="text-xs">Base + {f.agents.length ? f.agents.map((a) => catalog?.agents.find((x) => x.id === a)?.name ?? a).join(", ") : "sin agentes opcionales"}</p>
                  <div className="flex gap-2">
                    <button type="button" className="btn-ghost px-3 py-1.5 text-xs" onClick={() => open(f)}>
                      {canManage ? "Editar" : "Ver"}
                    </button>
                    {canManage && (
                      <button type="button" className="btn-ghost px-3 py-1.5 text-xs text-bad" onClick={() => void archiveFlow(f.flowId).then(load)}>
                        <Archive className="h-3.5 w-3.5" aria-hidden="true" /> Archivar
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {editing && (
        <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
          <aside className="glass max-h-[calc(100vh-12rem)] space-y-4 overflow-y-auto p-4" aria-label="Agentes disponibles">
            <div className="space-y-2">
              <label className="block space-y-1 text-sm">
                <span className="text-muted-foreground">Nombre del flujo</span>
                <input className="field" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} disabled={!canManage} />
              </label>
              <label className="block space-y-1 text-sm">
                <span className="text-muted-foreground">Para qué sirve</span>
                <textarea className="field min-h-[64px]" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={600} disabled={!canManage} />
              </label>
            </div>
            {canManage && <p className="text-xs text-muted-foreground">Arrastra un agente al lienzo o usa «+». Pasa el cursor por cada uno para ver qué hace.</p>}
            {groups.map(([title, agents]) =>
              agents.length ? (
                <section key={title} className="space-y-2">
                  <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</h2>
                  <ul className="space-y-1.5">
                    {agents.map((a) => (
                      <PaletteItem key={a.id} agent={a} state={stateOf(a)} canEdit={canManage} onToggle={() => toggle(a.id)} onInfo={() => setInfo(a.id)} />
                    ))}
                  </ul>
                </section>
              ) : null,
            )}
          </aside>
          <section className="space-y-3">
            <div
              className={cn("glass h-[calc(100vh-16rem)] min-h-[520px] overflow-hidden p-0 transition", over && "ring-2 ring-secondary/60")}
              onDragOver={(e) => {
                if (e.dataTransfer.types.includes("text/nadf-agent")) {
                  e.preventDefault();
                  setOver(true);
                }
              }}
              onDragLeave={() => setOver(false)}
              onDrop={(e) => {
                setOver(false);
                add(e.dataTransfer.getData("text/nadf-agent"));
              }}
              aria-label="Lienzo del flujo"
            >
              <WorkflowCanvas workflow={preview} nodeState={{}} selected={null} technical={false} onSelect={(id) => setInfo(id)} />
            </div>
            <div className="flex flex-wrap gap-2">
              {canManage && (
                <button type="button" className="btn-primary" disabled={busy || name.trim().length < 3} onClick={() => void save()}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />} Guardar flujo
                </button>
              )}
              <button type="button" className="btn-ghost" onClick={() => setEditing(null)}>
                Volver
              </button>
            </div>
          </section>
        </div>
      )}
      {info && <AgentDefinitionDialog agentId={info} companyName={me.company.name} onClose={() => setInfo(null)} />}
    </div>
  );
}
