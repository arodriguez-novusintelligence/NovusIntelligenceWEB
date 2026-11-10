import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Panel, PanelGroup, PanelResizeHandle, type ImperativePanelHandle } from "react-resizable-panels";
import { ArrowLeft, Ban, Cpu, Eye, GitPullRequest, Loader2, PanelBottomClose, PanelBottomOpen, PanelRightClose, PanelRightOpen, Pause, Play, RotateCw, Wifi, WifiOff } from "lucide-react";
import { cancelRequest, resumeRequest, stopRequest } from "@/api/admin";
import { ApiError, decide, getRequest, startPlan, type AgentEvent, type Me, type RequestDetail } from "@/api/client";
import type { NodeDecision } from "@/components/studio/AgentNode";
import { AgentConsole } from "@/components/pipeline/AgentConsole";
import { StatusBadge } from "@/components/pipeline/StatusBadge";
import { ApprovalNodePanel, RollbackNodePanel } from "@/components/studio/ApprovalNodePanel";
import { NodeInspector } from "@/components/studio/NodeInspector";
import { ResultPanel } from "@/components/studio/ResultPanel";
import { WorkflowCanvas } from "@/components/studio/WorkflowCanvas";
import { cn } from "@/lib/cn";
import { isActive, timeAgo } from "@/lib/pipeline";
import { functionalSummary, mergeEvents } from "@/lib/studio";

const POLL_ACTIVE = 2500;
const POLL_IDLE = 15000;

function useWide() {
  const [wide, setWide] = useState(() => window.matchMedia("(min-width: 1024px)").matches);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const on = () => setWide(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return wide;
}

/** Visual Execution Studio de una solicitud. La fuente de verdad es el backend (consulta incremental reanudable). */
export function RequestDetailPage({ me, mfaEnabled }: { me: Me; mfaEnabled: boolean }) {
  const { id = "" } = useParams();
  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [online, setOnline] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [technical, setTechnical] = useState(false);
  const [bottomTab, setBottomTab] = useState<"console" | "result">("console");
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [bottomOpen, setBottomOpen] = useState(true);
  const last = useRef<string | undefined>(undefined);
  const failures = useRef(0);
  const inspectorRef = useRef<ImperativePanelHandle>(null);
  const bottomRef = useRef<ImperativePanelHandle>(null);
  const wide = useWide();

  const load = useCallback(async () => {
    try {
      const data = await getRequest(id, last.current);
      setRequest(data.request);
      if (data.events.length) {
        setEvents((prev) => {
          const merged = mergeEvents(prev, data.events);
          last.current = merged[merged.length - 1]?.id;
          return merged;
        });
      }
      failures.current = 0;
      setOnline(true);
      setError(null);
      return data.request;
    } catch (e) {
      failures.current += 1;
      setOnline(false);
      if (e instanceof ApiError && (e.status === 404 || e.status === 403)) setError(e.message);
      return null;
    }
  }, [id]);

  useEffect(() => {
    last.current = undefined;
    failures.current = 0;
    setEvents([]);
    setRequest(null);
    setSelected(null);
    let timer: ReturnType<typeof setTimeout>;
    let stopped = false;
    const tick = async () => {
      const r = await load();
      if (stopped) return;
      // Reconexión automática con espera creciente; al volver recupera los eventos desde el último recibido.
      const backoff = failures.current ? Math.min(30000, 2000 * 2 ** (failures.current - 1)) : null;
      timer = setTimeout(tick, backoff ?? (r && isActive(r.status) ? POLL_ACTIVE : POLL_IDLE));
    };
    void tick();
    const onVisible = () => document.visibilityState === "visible" && void load();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stopped = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [load]);

  // Selección por defecto: lo que está pasando ahora (o lo que necesita una decisión).
  useEffect(() => {
    if (!request?.workflow || selected) return;
    const ns = request.nodeState ?? {};
    const pick =
      request.workflow.nodes.find((n) => ns[n.id]?.status === "WAITING_APPROVAL") ??
      request.workflow.nodes.find((n) => ns[n.id]?.status === "RUNNING") ??
      request.workflow.nodes.find((n) => ["FAILED", "BLOCKED"].includes(ns[n.id]?.status ?? "")) ??
      null;
    if (pick) setSelected(pick.id);
  }, [request, selected]);

  const summary = useMemo(() => (request ? functionalSummary(request) : null), [request]);
  const [control, setControl] = useState<"stop" | "cancel" | null>(null);
  const [controlBusy, setControlBusy] = useState(false);
  const [controlError, setControlError] = useState<string | null>(null);

  // Aprobar / Denegar dentro del nodo (backend real; aprobar exige MFA y el permiso de aprobador).
  const decisions = useMemo<Record<string, NodeDecision | null>>(() => {
    if (!request || !me.permissions.includes("approvals.decide")) return {};
    const after = async (fn: Promise<unknown>) => {
      try {
        await fn;
      } catch (e) {
        throw new Error(e instanceof ApiError ? e.message : "No se pudo registrar la decisión.");
      }
      await load();
    };
    const noMfa = mfaEnabled ? null : "Activa la verificación en dos pasos para aprobar.";
    const out: Record<string, NodeDecision | null> = {};
    if (request.status === "awaiting_approval") {
      out["human-approval"] = {
        approveLabel: "Aprobar",
        confirmText: `¿Desplegar en PROD (${request.app?.url ?? "producción"})?`,
        disabledReason: noMfa,
        onApprove: () => after(decide(request.requestId, "approve")),
        onDeny: () => after(decide(request.requestId, "reject")),
      };
    }
    if (request.status === "rollback_requested") {
      out.rollback = {
        approveLabel: "Aprobar rollback",
        confirmText: "¿Restaurar la versión anterior de PROD?",
        disabledReason: noMfa,
        onApprove: () => after(decide(request.requestId, "approve_rollback")),
        onDeny: () => after(decide(request.requestId, "reject_rollback")),
      };
    }
    return out;
  }, [request, me.permissions, mfaEnabled, load]);

  if (error && !request) {
    return (
      <div className="glass mx-auto mt-10 max-w-lg space-y-3 p-6 text-center">
        <p>{error}</p>
        <Link to="/solicitudes" className="btn-ghost">
          Volver a solicitudes
        </Link>
      </div>
    );
  }
  if (!request) {
    return (
      <p className="flex items-center gap-2 pt-10 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Abriendo el Visual Execution Studio…
      </p>
    );
  }

  const wf = request.workflow;
  const node = wf?.nodes.find((n) => n.id === selected) ?? null;
  const working = isActive(request.status);
  const canStart = request.status === "planned" && (me.permissions.includes("approvals.decide") || (me.permissions.includes("requests.create") && request.createdBy.id === me.user.id));
  const canControl = me.permissions.includes("approvals.decide") || me.permissions.includes("deployments.operate") || (me.permissions.includes("requests.create") && request.createdBy.id === me.user.id);
  const canStop = canControl && ["planning", "queued", "developing"].includes(request.status);
  const canResume = canControl && request.status === "stopped";
  const canCancel = canControl && !["approved", "deploying", "rollback_approved", "rolling_back", "deployed", "rejected", "cancelled", "rolled_back"].includes(request.status);

  async function runControl(kind: "stop" | "cancel" | "resume") {
    setControlBusy(true);
    setControlError(null);
    try {
      if (kind === "stop") await stopRequest(request!.requestId);
      else if (kind === "cancel") await cancelRequest(request!.requestId);
      else await resumeRequest(request!.requestId);
      setControl(null);
      await load();
    } catch (e) {
      setControlError(e instanceof ApiError ? e.message : "No se pudo completar la acción.");
    } finally {
      setControlBusy(false);
    }
  }

  async function runPlan() {
    setStarting(true);
    setStartError(null);
    try {
      await startPlan(request!.requestId);
      await load();
    } catch (e) {
      setStartError(e instanceof ApiError ? e.message : "No se pudo iniciar la ejecución.");
    } finally {
      setStarting(false);
    }
  }

  const toggle = (ref: React.RefObject<ImperativePanelHandle>, open: boolean) => (open ? ref.current?.collapse() : ref.current?.expand());

  const canvas = wf ? (
    <WorkflowCanvas workflow={wf} nodeState={request.nodeState ?? {}} selected={selected} technical={technical} onSelect={setSelected} decisions={decisions} />
  ) : (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> El Analista y el Orquestador están armando el plan real…
    </div>
  );

  const inspector = node ? (
    <NodeInspector request={request} node={node} events={events} technical={technical} permissions={me.permissions} userId={me.user.id} companyName={me.company.name} onClose={() => setSelected(null)} onChanged={() => void load()}>
      {node.id === "human-approval" && <ApprovalNodePanel request={request} permissions={me.permissions} userId={me.user.id} mfaEnabled={mfaEnabled} onDone={() => void load()} />}
      {node.id === "rollback" && <RollbackNodePanel request={request} permissions={me.permissions} mfaEnabled={mfaEnabled} onDone={() => void load()} />}
    </NodeInspector>
  ) : (
    <div className="flex h-full items-center justify-center p-6 text-center text-sm text-muted-foreground">Selecciona un agente del canvas para ver su prompt, reglas, entradas, salidas y logs.</div>
  );

  const bottom = (
    <div className="flex h-full flex-col">
      <nav className="flex items-center gap-1 border-b border-white/10 px-2 py-1.5">
        <button type="button" onClick={() => setBottomTab("console")} className={cn("rounded-lg px-2.5 py-1 text-xs", bottomTab === "console" ? "bg-white/10" : "text-muted-foreground")}>
          Consola de eventos
        </button>
        <button type="button" onClick={() => setBottomTab("result")} className={cn("rounded-lg px-2.5 py-1 text-xs", bottomTab === "result" ? "bg-white/10" : "text-muted-foreground")}>
          Resultado
        </button>
        {working && bottomTab === "console" && <span className="ml-auto chip py-0.5 text-[11px] text-secondary">En vivo</span>}
      </nav>
      <div className="min-h-0 flex-1 overflow-hidden">
        {bottomTab === "console" ? (
          <div className="h-full overflow-y-auto p-3">
            <AgentConsole events={technical ? events : events.filter((e) => e.kind !== "tool")} working={working} />
          </div>
        ) : (
          <ResultPanel request={request} permissions={me.permissions} onChanged={() => void load()} />
        )}
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1600px] space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <Link to="/solicitudes" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Solicitudes
          </Link>
          <h1 className="text-xl font-semibold sm:text-2xl">{request.title ?? request.prompt.slice(0, 90)}</h1>
          <p className="text-xs text-muted-foreground">
            {request.app?.name ?? request.appId} · {wf?.legacy ? "pipeline fijo v0" : wf ? `perfil ${wf.profile}${wf.confidence != null ? ` (confianza ${wf.confidence})` : ""}` : "planificando"} · pedido por {request.createdBy.name ?? request.createdBy.email} {timeAgo(request.createdAt)}
            {request.iteration > 1 ? ` · iteración ${request.iteration}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={request.status} />
          <span className={cn("inline-flex items-center gap-1 text-xs", online ? "text-good" : "text-warn")} role="status">
            {online ? <Wifi className="h-3.5 w-3.5" aria-hidden="true" /> : <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />} {online ? "Conectado" : "Reconectando…"}
          </span>
          <div className="flex rounded-xl border border-white/10 p-0.5 text-xs" role="group" aria-label="Nivel de detalle">
            <button type="button" onClick={() => setTechnical(false)} className={cn("inline-flex items-center gap-1 rounded-lg px-2 py-1", !technical && "bg-white/10")}>
              <Eye className="h-3.5 w-3.5" aria-hidden="true" /> Funcional
            </button>
            <button type="button" onClick={() => setTechnical(true)} className={cn("inline-flex items-center gap-1 rounded-lg px-2 py-1", technical && "bg-white/10")}>
              <Cpu className="h-3.5 w-3.5" aria-hidden="true" /> Técnica
            </button>
          </div>
          {canStop && (
            <button type="button" className="btn-ghost px-2.5 py-1 text-xs text-warn" onClick={() => setControl("stop")}>
              <Pause className="h-3.5 w-3.5" aria-hidden="true" /> Detener
            </button>
          )}
          {canResume && (
            <button type="button" className="btn-primary px-2.5 py-1 text-xs" disabled={controlBusy} onClick={() => void runControl("resume")}>
              {controlBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />} Reanudar
            </button>
          )}
          {canCancel && (
            <button type="button" className="btn-ghost px-2.5 py-1 text-xs text-bad" onClick={() => setControl("cancel")}>
              <Ban className="h-3.5 w-3.5" aria-hidden="true" /> Cancelar
            </button>
          )}
          {request.prUrl && (
            <a href={request.prUrl} target="_blank" rel="noreferrer" className="btn-ghost px-2.5 py-1 text-xs">
              <GitPullRequest className="h-3.5 w-3.5" aria-hidden="true" /> PR #{request.prNumber}
            </a>
          )}
        </div>
      </div>

      {control && (
        <section className="glass flex flex-wrap items-center gap-3 border-warn/40 p-3 text-sm" role="alertdialog" aria-label={control === "stop" ? "Detener ejecución" : "Cancelar solicitud"}>
          <p className="min-w-0 flex-1">
            {control === "stop"
              ? "Detener corta la ejecución en curso. Los agentes que estaban trabajando quedan cancelados y podrás reanudar después (se crea una nueva iteración)."
              : "Cancelar cierra la solicitud definitivamente. Si hay un PR abierto, queda en GitHub para que lo cierres."}
          </p>
          <button type="button" className={control === "stop" ? "btn-primary" : "btn-ghost text-bad"} disabled={controlBusy} onClick={() => void runControl(control)}>
            {controlBusy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />} {control === "stop" ? "Sí, detener" : "Sí, cancelar"}
          </button>
          <button type="button" className="btn-ghost" disabled={controlBusy} onClick={() => setControl(null)}>
            Volver
          </button>
        </section>
      )}
      {controlError && <p className="text-sm text-bad" role="alert">{controlError}</p>}
      {request.status === "stopped" && request.stopped && (
        <p className="glass p-3 text-sm text-warn">
          Detenida por {request.stopped.by.name ?? request.stopped.by.email} el {new Date(request.stopped.at).toLocaleString("es-CO")}. Pulsa «Reanudar» para continuar.
        </p>
      )}

      {(request.attachments?.length ?? 0) > 0 && (
        <section className="flex flex-wrap items-center gap-1.5 text-xs" aria-label="Adjuntos de la solicitud">
          <span className="text-muted-foreground">Adjuntos:</span>
          {request.attachments!.map((a) => (
            <a key={a.key} href={a.url} target="_blank" rel="noreferrer" className="chip hover:border-white/25" title={`${a.name} · ${Math.max(1, Math.round(a.size / 1024))} KB`}>
              {a.kind === "image" ? <img src={a.url} alt="" className="h-4 w-4 rounded object-cover" /> : <span className="font-mono text-[10px] uppercase text-secondary">{a.kind === "word" ? "docx" : a.kind === "pdf" ? "pdf" : "txt"}</span>}
              <span className="max-w-[200px] truncate">{a.name}</span>
            </a>
          ))}
        </section>
      )}

      {summary && (
        <section className="glass grid gap-2 p-3 text-sm sm:grid-cols-3" aria-label="Resumen funcional">
          <p>
            <span className="block text-xs uppercase tracking-wider text-muted-foreground">Qué se está haciendo</span>
            {summary.doing}
          </p>
          <p>
            <span className="block text-xs uppercase tracking-wider text-muted-foreground">Qué falta</span>
            {summary.pending.length ? summary.pending.join(" → ") : "Nada pendiente."}
          </p>
          <p className={cn(summary.needsYou && "text-warn")}>
            <span className="block text-xs uppercase tracking-wider text-muted-foreground">Necesita a una persona</span>
            {summary.needsYou ?? "No por ahora."}
          </p>
        </section>
      )}

      {request.status === "planned" && (
        <section className="glass ai-border flex flex-wrap items-center gap-3 p-3">
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-medium">Plan listo para ejecutar</p>
            <p className="text-muted-foreground">
              Revisa los agentes del canvas y, si quieres, ajusta sus reglas configurables (pestaña Reglas). Al ejecutar, las reglas quedan congeladas y la aprobación del plan queda registrada.
            </p>
          </div>
          {canStart && (
            <button type="button" className="btn-primary" disabled={starting} onClick={() => void runPlan()}>
              {starting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />} Ejecutar plan
            </button>
          )}
          {startError && <p className="w-full text-sm text-bad" role="alert">{startError}</p>}
        </section>
      )}
      {request.error && request.status !== "planned" && (
        <div className="glass border-bad/40 p-3 text-sm" role="alert">
          <p className="font-medium text-bad">{request.error.message}</p>
          <p className="font-mono text-xs text-muted-foreground">{request.error.code}</p>
        </div>
      )}

      {wide ? (
        <div className="glass h-[calc(100vh-15rem)] min-h-[620px] overflow-hidden p-0">
          <PanelGroup direction="vertical" autoSaveId="nadf-studio-v">
            <Panel defaultSize={66} minSize={30}>
              <PanelGroup direction="horizontal" autoSaveId="nadf-studio-h">
                <Panel defaultSize={64} minSize={35}>
                  <div className="relative h-full">
                    {canvas}
                    <div className="absolute right-2 top-2 flex gap-1">
                      <button type="button" className="btn-ghost bg-background/70 px-2 py-1" aria-label={inspectorOpen ? "Contraer inspector" : "Expandir inspector"} onClick={() => toggle(inspectorRef, inspectorOpen)}>
                        {inspectorOpen ? <PanelRightClose className="h-4 w-4" aria-hidden="true" /> : <PanelRightOpen className="h-4 w-4" aria-hidden="true" />}
                      </button>
                      <button type="button" className="btn-ghost bg-background/70 px-2 py-1" aria-label={bottomOpen ? "Contraer consola" : "Expandir consola"} onClick={() => toggle(bottomRef, bottomOpen)}>
                        {bottomOpen ? <PanelBottomClose className="h-4 w-4" aria-hidden="true" /> : <PanelBottomOpen className="h-4 w-4" aria-hidden="true" />}
                      </button>
                    </div>
                  </div>
                </Panel>
                <PanelResizeHandle className="w-1.5 bg-white/5 transition hover:bg-secondary/40" />
                <Panel ref={inspectorRef} defaultSize={36} minSize={22} collapsible collapsedSize={0} onCollapse={() => setInspectorOpen(false)} onExpand={() => setInspectorOpen(true)}>
                  <div className="h-full border-l border-white/10 bg-background/40">{inspector}</div>
                </Panel>
              </PanelGroup>
            </Panel>
            <PanelResizeHandle className="h-1.5 bg-white/5 transition hover:bg-secondary/40" />
            <Panel ref={bottomRef} defaultSize={34} minSize={14} collapsible collapsedSize={0} onCollapse={() => setBottomOpen(false)} onExpand={() => setBottomOpen(true)}>
              <div className="h-full border-t border-white/10 bg-background/40">{bottom}</div>
            </Panel>
          </PanelGroup>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="glass h-[520px] overflow-hidden p-0">{canvas}</div>
          {node && <div className="glass max-h-[640px] overflow-hidden p-0">{inspector}</div>}
          <div className="glass h-[560px] overflow-hidden p-0">{bottom}</div>
        </div>
      )}
    </div>
  );
}
