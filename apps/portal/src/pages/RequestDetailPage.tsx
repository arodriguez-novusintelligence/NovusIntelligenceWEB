import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, GitPullRequest, Loader2, MessageSquareQuote, Rocket } from "lucide-react";
import { ApiError, getRequest, type AgentEvent, type Me, type RequestDetail } from "@/api/client";
import { AgentConsole } from "@/components/pipeline/AgentConsole";
import { AppWindow } from "@/components/pipeline/AppWindow";
import { DecisionPanel } from "@/components/pipeline/DecisionPanel";
import { PipelineStepper } from "@/components/pipeline/PipelineStepper";
import { ReportCard, Screenshots, TestList } from "@/components/pipeline/ReportCard";
import { StatusBadge } from "@/components/pipeline/StatusBadge";
import { isActive, timeAgo } from "@/lib/pipeline";

const POLL_MS = 2500;

export function RequestDetailPage({ me, mfaEnabled }: { me: Me; mfaEnabled: boolean }) {
  const { id = "" } = useParams();
  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const last = useRef<string | undefined>(undefined);

  const load = useCallback(async () => {
    try {
      const data = await getRequest(id, last.current);
      setRequest(data.request);
      if (data.events.length) {
        last.current = data.events[data.events.length - 1].id;
        setEvents((prev) => {
          const seen = new Set(prev.map((e) => e.id));
          return [...prev, ...data.events.filter((e) => !seen.has(e.id))];
        });
      }
      setError(null);
      return data.request;
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No pudimos cargar la solicitud.");
      return null;
    }
  }, [id]);

  useEffect(() => {
    last.current = undefined;
    setEvents([]);
    setRequest(null);
    let timer: ReturnType<typeof setTimeout>;
    let stopped = false;
    const tick = async () => {
      const r = await load();
      if (!stopped) timer = setTimeout(tick, r && isActive(r.status) ? POLL_MS : 15000);
    };
    void tick();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [load]);

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
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Cargando la solicitud…
      </p>
    );
  }

  const working = isActive(request.status);
  const hasPreview = Boolean(request.previewUrl) && !["queued", "developing"].includes(request.status);
  const routes = request.report?.rutas_a_revisar?.length ? request.report.rutas_a_revisar : ["/"];

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="space-y-3">
        <Link to="/solicitudes" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Solicitudes
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-secondary">
              {request.app?.name ?? request.appId} · pipeline PROD{request.iteration > 1 ? ` · iteración ${request.iteration}` : ""}
            </p>
            <h1 className="text-2xl font-semibold sm:text-3xl">{request.title ?? request.prompt.slice(0, 90)}</h1>
            <p className="text-sm text-muted-foreground">
              Pedido por {request.createdBy.name ?? request.createdBy.email} · {timeAgo(request.createdAt)}
              {typeof request.costUsd === "number" ? ` · consumo IA ${request.costUsd.toFixed(2)} USD` : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={request.status} />
            {request.prUrl && (
              <a href={request.prUrl} target="_blank" rel="noreferrer" className="btn-ghost px-3 py-1.5 text-xs">
                <GitPullRequest className="h-3.5 w-3.5" aria-hidden="true" /> PR #{request.prNumber}
              </a>
            )}
            {request.status === "deployed" && request.app && (
              <a href={request.app.url} target="_blank" rel="noreferrer" className="btn-primary px-3 py-1.5 text-xs">
                <Rocket className="h-3.5 w-3.5" aria-hidden="true" /> Ver en PROD
              </a>
            )}
          </div>
        </div>
      </div>

      <section className="glass p-4">
        <PipelineStepper status={request.status} stage={request.stage} />
      </section>

      {request.error && (
        <div className="glass border-bad/40 p-4 text-sm" role="alert">
          <p className="font-medium text-bad">{request.error.message}</p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">{request.error.code}</p>
        </div>
      )}

      <DecisionPanel request={request} permissions={me.permissions} userId={me.user.id} mfaEnabled={mfaEnabled} onDone={() => void load()} />

      <div className="grid gap-5 xl:grid-cols-5">
        <div className="space-y-5 xl:col-span-3">
          {hasPreview && (
            <section className="space-y-3" aria-labelledby="window-title">
              <div className="flex items-baseline justify-between gap-2">
                <h2 id="window-title" className="text-lg font-semibold">
                  Ventana de la aplicación
                </h2>
                <span className="text-xs text-muted-foreground">{request.status === "deployed" ? "Versión desplegada" : "Vista previa privada con los cambios"}</span>
              </div>
              <AppWindow requestId={request.requestId} routes={routes} label={request.status === "deployed" ? "en PROD" : "vista previa"} />
            </section>
          )}

          <section className="glass p-5" aria-labelledby="console-title">
            <div className="mb-3 flex items-center justify-between">
              <h2 id="console-title" className="text-lg font-semibold">
                Consola del agente
              </h2>
              {working && <span className="chip text-secondary">En vivo</span>}
            </div>
            <AgentConsole events={events} working={working} />
          </section>
        </div>

        <div className="space-y-5 xl:col-span-2">
          <section className="glass space-y-3 p-5" aria-labelledby="ask-title">
            <h2 id="ask-title" className="flex items-center gap-2 text-lg font-semibold">
              <MessageSquareQuote className="h-5 w-5 text-secondary" aria-hidden="true" /> Lo que se pidió
            </h2>
            <p className="whitespace-pre-wrap text-sm text-foreground/90">{request.prompt}</p>
            {request.feedback?.map((f) => (
              <p key={f.at} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm">
                <span className="text-muted-foreground">{f.by.name ?? f.by.email}: </span>
                {f.text}
              </p>
            ))}
          </section>

          {request.report && (
            <section className="glass p-5" aria-labelledby="report-title">
              <h2 id="report-title" className="mb-3 text-lg font-semibold">
                Informe del agente
              </h2>
              <ReportCard report={request.report} />
            </section>
          )}

          <section className="glass space-y-4 p-5" aria-labelledby="tests-title">
            <h2 id="tests-title" className="text-lg font-semibold">
              Pruebas
            </h2>
            <TestList tests={request.tests} />
            <Screenshots shots={request.screenshots} />
          </section>

          {request.deployment && (request.deployment.smoke?.length || request.deployment.screenshots.length) ? (
            <section className="glass space-y-4 p-5" aria-labelledby="deploy-title">
              <h2 id="deploy-title" className="text-lg font-semibold">
                Verificación en PROD
              </h2>
              <TestList tests={request.deployment.smoke} />
              <Screenshots shots={request.deployment.screenshots} />
              {request.app && (
                <a href={request.app.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                  {request.app.url} <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              )}
            </section>
          ) : null}

          {request.diffStat && (
            <details className="glass p-5 text-sm">
              <summary className="cursor-pointer select-none font-medium">Resumen técnico del cambio</summary>
              <pre className="mt-3 overflow-x-auto whitespace-pre font-mono text-xs text-muted-foreground">{request.diffStat}</pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}
