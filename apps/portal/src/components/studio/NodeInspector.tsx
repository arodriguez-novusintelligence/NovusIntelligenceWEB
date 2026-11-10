import { useEffect, useState, type ReactNode } from "react";
import { Loader2, X } from "lucide-react";
import { nodeIo, type AgentEvent, type NodeIo, type RequestDetail, type WorkflowNode } from "@/api/client";
import { cn } from "@/lib/cn";
import type { Permission } from "@/lib/navigation";
import { STATUS_LABEL, duration, elapsed, eventsFor, statusOf, toolsUsed } from "@/lib/studio";
import { AgentConsole } from "../pipeline/AgentConsole";
import { RulesEditor } from "./RulesEditor";

type Tab = "general" | "prompt" | "rules" | "io" | "tools" | "logs" | "metrics";

const TABS: { id: Tab; label: string; technical: boolean }[] = [
  { id: "general", label: "General", technical: false },
  { id: "prompt", label: "Prompt", technical: true },
  { id: "rules", label: "Reglas", technical: false },
  { id: "io", label: "Entradas y salidas", technical: true },
  { id: "tools", label: "Herramientas", technical: true },
  { id: "logs", label: "Logs", technical: false },
  { id: "metrics", label: "Métricas", technical: true },
];

function Row({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-2 border-b border-white/5 py-1.5 text-sm">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="min-w-0 break-words">{v ?? "—"}</dd>
    </div>
  );
}

function Json({ value }: { value: unknown }) {
  if (value == null) return <p className="text-sm text-muted-foreground">Sin datos registrados.</p>;
  return <pre className="max-h-[360px] overflow-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-black/30 p-3 font-mono text-[11.5px] text-foreground/90">{typeof value === "string" ? value : JSON.stringify(value, null, 2)}</pre>;
}

/** Inspector del nodo seleccionado: todo sale de lo persistido por el ejecutor (sin secretos). */
export function NodeInspector({
  request,
  node,
  events,
  technical,
  permissions,
  userId,
  onClose,
  onChanged,
  children,
}: {
  request: RequestDetail;
  node: WorkflowNode;
  events: AgentEvent[];
  technical: boolean;
  permissions: Permission[];
  userId: string;
  onClose: () => void;
  onChanged: () => void;
  children?: ReactNode;
}) {
  const [tab, setTab] = useState<Tab>("general");
  const [attempt, setAttempt] = useState<number | null>(null);
  const [io, setIo] = useState<NodeIo | null | undefined>(undefined);
  const state = request.nodeState[node.id];
  const status = statusOf(node, state);
  const attempts = state?.attempts ?? [];
  const current = attempt ?? attempts.length;
  const sel = attempts[current - 1];

  useEffect(() => {
    setTab((t) => (!technical && TABS.find((x) => x.id === t)?.technical ? "general" : t));
  }, [technical]);
  useEffect(() => {
    setAttempt(null);
    setIo(undefined);
  }, [node.id]);
  useEffect(() => {
    if (!["prompt", "io"].includes(tab) || !attempts.length || request.workflow?.legacy) return;
    let cancelled = false;
    setIo(undefined);
    nodeIo(request.requestId, node.id, current)
      .then((x) => !cancelled && setIo(x))
      .catch(() => !cancelled && setIo(null));
    return () => {
      cancelled = true;
    };
  }, [tab, current, node.id, request.requestId, attempts.length, request.workflow?.legacy]);

  const canEditRules = request.status === "planned" && !request.rules?.locked && (permissions.includes("approvals.decide") || permissions.includes("agents.manage") || (permissions.includes("requests.create") && request.createdBy.id === userId));
  const lockedReason = request.rules?.locked
    ? `Reglas congeladas al ejecutar el plan (${request.rules.lockedBy?.name ?? request.rules.lockedBy?.email ?? ""}). Para cambiarlas, pide ajustes: se crea una nueva iteración.`
    : request.status === "planning"
      ? "El plan todavía se está generando."
      : "Solo se editan con el plan listo y antes de ejecutarlo.";
  const nodeEvents = eventsFor(events, node.id);
  const tools = toolsUsed(events, node.id);
  const metrics = sel?.metrics ?? state?.metrics;

  return (
    <aside className="flex h-full flex-col" aria-label={`Inspector de ${node.label}`}>
      <header className="flex items-start gap-2 border-b border-white/10 p-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold">{node.label}</p>
          <p className="text-xs text-muted-foreground">
            {STATUS_LABEL[status]}
            {state?.startedAt ? ` · ${duration(elapsed(state))}` : ""}
            {attempts.length > 1 ? ` · ${attempts.length} intentos` : ""}
          </p>
        </div>
        <button type="button" className="btn-ghost px-2 py-1.5" aria-label="Cerrar inspector" onClick={onClose}>
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </header>
      <nav className="flex gap-1 overflow-x-auto border-b border-white/10 px-2 py-1.5" aria-label="Pestañas del inspector">
        {TABS.filter((t) => technical || !t.technical).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn("shrink-0 rounded-lg px-2.5 py-1 text-xs", tab === t.id ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            {t.label}
          </button>
        ))}
      </nav>
      {attempts.length > 1 && ["prompt", "io", "metrics"].includes(tab) && (
        <div className="flex flex-wrap gap-1 border-b border-white/10 px-3 py-1.5 text-xs">
          {attempts.map((a, i) => (
            <button key={i} type="button" onClick={() => setAttempt(i + 1)} className={cn("chip px-2 py-0.5", current === i + 1 && "border-secondary/60 text-foreground")}>
              Intento {i + 1} · it. {a.iteration}
            </button>
          ))}
        </div>
      )}

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-3">
        {tab === "general" && children}
        {tab === "general" && (
          <dl>
            <Row k="Identificador" v={<span className="font-mono text-xs">{node.agentId ?? node.id}</span>} />
            <Row k="Función" v={node.role} />
            <Row k="Decisión del plan" v={node.reason} />
            <Row k="Capa / patrón" v={[node.layer, node.pattern].filter(Boolean).join(" · ") || null} />
            <Row k="Modelo IA" v={node.model ?? "Sin modelo (paso determinista de la plataforma)"} />
            <Row k="Versión" v={request.workflow?.framework?.sha ? `${request.workflow.framework.branch}@${request.workflow.framework.sha.slice(0, 7)}` : request.workflow?.legacy ? "Pipeline fijo v0" : null} />
            <Row k="Estado" v={STATUS_LABEL[status]} />
            <Row k="Inicio" v={state?.startedAt ? new Date(state.startedAt).toLocaleString("es-CO") : null} />
            <Row k="Último evento" v={state?.lastEvent} />
            <Row k="Dependencias" v={request.workflow?.edges.filter((e) => e.target === node.id).map((e) => request.workflow?.nodes.find((n) => n.id === e.source)?.label ?? e.source).join(", ") || null} />
            {node.definition?.responsibilities?.length ? <Row k="Responsabilidades" v={<ul className="list-disc pl-4">{node.definition.responsibilities.map((r) => <li key={r}>{r}</li>)}</ul>} /> : null}
            {sel?.error && <Row k="Error" v={<span className="text-bad">{sel.error.message}</span>} />}
          </dl>
        )}

        {tab === "prompt" &&
          (io === undefined && attempts.length ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Cargando…</p>
          ) : !io?.prompt ? (
            <p className="text-sm text-muted-foreground">{node.model ? "Aún no se ejecutó este agente." : "Este paso es determinista: no usa prompt."}</p>
          ) : (
            <div className="space-y-3">
              <section><h4 className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">Prompt base ({node.definition?.path ?? "framework"})</h4><Json value={io.prompt.base} /></section>
              <section><h4 className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">Instrucciones del agente y reglas</h4><Json value={io.prompt.instrucciones} /></section>
              <section><h4 className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">Prompt de la solicitud</h4><Json value={io.prompt.solicitud} /></section>
              <section><h4 className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">Variables de contexto</h4><Json value={io.prompt.contexto} /></section>
              <p className="text-xs text-muted-foreground">Versión: {io.prompt.version ?? io.framework?.sha?.slice(0, 7) ?? "—"} · sin secretos ni credenciales.</p>
            </div>
          ))}

        {tab === "rules" && (
          <RulesEditor requestId={request.requestId} nodeId={node.id} rules={request.rules} editable={canEditRules} lockedReason={lockedReason} onSaved={onChanged} />
        )}

        {tab === "io" &&
          (io === undefined && attempts.length ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Cargando…</p>
          ) : (
            <div className="space-y-3">
              <section><h4 className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">Entrada</h4><Json value={io?.input ?? sel?.input} /></section>
              <section><h4 className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">Resultado estructurado</h4><Json value={io?.output ?? sel?.output} /></section>
              {io?.artefactos != null && <section><h4 className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">Artefactos</h4><Json value={io.artefactos} /></section>}
              {io?.tool && <p className="text-xs text-muted-foreground">Motor: {io.tool}</p>}
              {sel?.error && <section><h4 className="mb-1 text-xs uppercase tracking-wider text-bad">Error</h4><Json value={sel.error} /></section>}
            </div>
          ))}

        {tab === "tools" &&
          (tools.length ? (
            <ul className="space-y-1.5">
              {tools.map((t) => (
                <li key={t.id} className="rounded-lg border border-white/10 px-2.5 py-1.5 font-mono text-[12px]">
                  {t.text}
                  <span className="block text-[10px] text-muted-foreground">{new Date(t.at).toLocaleTimeString("es-CO")}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Este paso no registró uso de herramientas.</p>
          ))}

        {tab === "logs" && <AgentConsole events={nodeEvents} working={status === "RUNNING"} />}

        {tab === "metrics" &&
          (metrics ? (
            <dl>
              <Row k="Modelo" v={metrics.model} />
              <Row k="Tokens de entrada" v={metrics.inputTokens?.toLocaleString("es-CO")} />
              <Row k="Tokens de salida" v={metrics.outputTokens?.toLocaleString("es-CO")} />
              <Row k="Costo" v={metrics.costUsd != null ? `${metrics.costUsd.toFixed(2)} USD (reportado por Claude Code)` : "No reportado por la API"} />
              <Row k="Turnos" v={metrics.turns} />
              <Row k="Duración" v={duration(sel?.durationMs ?? metrics.durationMs)} />
              <Row k="Reintentos" v={Math.max(0, attempts.length - 1)} />
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">Sin métricas: este paso no usa modelo o aún no se ejecuta.</p>
          ))}
      </div>
    </aside>
  );
}
