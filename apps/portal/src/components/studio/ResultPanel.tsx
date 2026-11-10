import { useState } from "react";
import { Check, Download, ExternalLink, FileJson, FileText, Loader2, Printer, Undo2 } from "lucide-react";
import { ApiError, exportRun, requestRollback, type RequestDetail } from "@/api/client";
import { cn } from "@/lib/cn";
import type { Permission } from "@/lib/navigation";
import { MILESTONE_LABEL, milestones, type Milestone } from "@/lib/studio";
import { AppWindow } from "../pipeline/AppWindow";
import { CostPanel } from "./CostPanel";
import { ReportCard, Screenshots, TestList } from "../pipeline/ReportCard";

type Tab = "preview" | "tests" | "deploy" | "cost" | "evidence";

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/** Resultado de la ejecución: vista previa, pruebas, despliegue por entorno y evidencias. */
export function ResultPanel({ request, permissions, onChanged }: { request: RequestDetail; permissions: Permission[]; onChanged: () => void }) {
  const [tab, setTab] = useState<Tab>(request.previewUrl ? "preview" : "tests");
  const [compare, setCompare] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [askRollback, setAskRollback] = useState(false);

  const routes = request.report?.rutas_a_revisar?.length ? request.report.rutas_a_revisar : ["/"];
  const before = request.screenshots.filter((s) => s.kind === "antes");
  const after = request.screenshots.filter((s) => s.kind !== "antes");
  const m = milestones(request);
  const dep = request.deployment;

  async function doExport(format: "json" | "html", print = false) {
    setBusy(format + (print ? "-pdf" : ""));
    setError(null);
    try {
      const blob = await exportRun(request.requestId, format);
      if (print) {
        const w = window.open(URL.createObjectURL(blob), "_blank");
        if (w) w.addEventListener("load", () => w.print(), { once: true });
      } else {
        download(blob, `nadf-${request.requestId.slice(0, 8)}-evidencias.${format}`);
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo exportar.");
    } finally {
      setBusy(null);
    }
  }

  async function doRollback() {
    setBusy("rollback");
    setError(null);
    try {
      await requestRollback(request.requestId, reason.trim());
      setAskRollback(false);
      setReason("");
      onChanged();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo solicitar el rollback.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <nav className="flex gap-1 border-b border-white/10 px-2 py-1.5" aria-label="Resultado">
        {(
          [
            ["preview", "Vista previa del cambio"],
            ["tests", "Pruebas"],
            ["deploy", "Despliegue"],
            ["cost", "Costo"],
            ["evidence", "Evidencias"],
          ] as [Tab, string][]
        ).map(([id, label]) => (
          <button key={id} type="button" onClick={() => setTab(id)} className={cn("rounded-lg px-2.5 py-1 text-xs", tab === id ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground")}>
            {label}
          </button>
        ))}
      </nav>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-3">
        {tab === "preview" &&
          (request.previewUrl ? (
            <>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="chip">Entorno: PROD (vista previa privada, el index público no cambia)</span>
                {before.length > 0 && (
                  <button type="button" className="btn-ghost px-2.5 py-1 text-xs" onClick={() => setCompare((c) => !c)}>
                    {compare ? "Ver la app" : "Comparar antes / después"}
                  </button>
                )}
              </div>
              {compare ? (
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="text-xs uppercase tracking-wider text-muted-foreground">Antes (PROD actual)</h4>
                    <Screenshots shots={before} />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs uppercase tracking-wider text-muted-foreground">Después (con el cambio)</h4>
                    <Screenshots shots={after} />
                  </div>
                </div>
              ) : (
                <AppWindow requestId={request.requestId} routes={routes} label={request.status === "deployed" ? "en PROD" : "vista previa"} />
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Todavía no hay vista previa: aparece cuando el Desarrollador termina y la Vista previa se publica. {after.length ? "" : "No se registraron capturas."}
            </p>
          ))}

        {tab === "tests" && (
          <div className="space-y-4">
            <TestList tests={request.tests} />
            <Screenshots shots={after} />
            {request.report && (
              <details className="text-sm">
                <summary className="cursor-pointer select-none font-medium">Informe del agente</summary>
                <div className="mt-3">
                  <ReportCard report={request.report} />
                </div>
              </details>
            )}
          </div>
        )}

        {tab === "deploy" && (
          <div className="space-y-4">
            <ol className="flex flex-wrap gap-2" aria-label="Etapas del cambio">
              {(Object.keys(MILESTONE_LABEL) as Milestone[]).map((k) => (
                <li key={k} className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs", m[k] ? "border-good/50 bg-good/10 text-good" : "border-white/10 text-muted-foreground")}>
                  {m[k] && <Check className="h-3 w-3" aria-hidden="true" />} {MILESTONE_LABEL[k]}
                </li>
              ))}
            </ol>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="py-1">Entorno</th>
                  <th className="py-1">Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-white/5">
                  <td className="py-1.5">DEV</td>
                  <td className="text-muted-foreground">No aplica: este pipeline va directo a PROD con revisión (decisión 2026-11-10).</td>
                </tr>
                <tr className="border-t border-white/5">
                  <td className="py-1.5">QA</td>
                  <td className="text-muted-foreground">No aplica en este pipeline.</td>
                </tr>
                <tr className="border-t border-white/5">
                  <td className="py-1.5">PROD</td>
                  <td>{m.VERIFIED ? "Desplegado y verificado" : m.DEPLOYED ? "Desplegado, verificación pendiente" : request.status === "rolled_back" ? "Revertido" : "No desplegado"}</td>
                </tr>
              </tbody>
            </table>
            {dep && (
              <dl className="grid grid-cols-[130px_1fr] gap-x-3 gap-y-1 text-sm">
                {(
                  [
                    ["URL", dep.url],
                    ["Commit", dep.commit?.slice(0, 10)],
                    ["Merge en main", dep.mergeCommit?.slice(0, 10) ?? (dep.merged === false ? "Pendiente" : null)],
                    ["Rama", dep.branch],
                    ["Pipeline", dep.buildId],
                    ["Versión", dep.version],
                    ["Fecha", dep.finishedAt ? new Date(dep.finishedAt).toLocaleString("es-CO") : null],
                    ["Aprobador", dep.approvedBy?.name ?? dep.approvedBy?.email],
                    ["Verificación", dep.verified ? "Superada" : "—"],
                  ] as [string, string | null | undefined][]
                ).map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="min-w-0 break-all">{v ?? "—"}</dd>
                  </div>
                ))}
              </dl>
            )}
            {dep?.smoke?.length ? <TestList tests={dep.smoke} /> : null}
            {dep?.screenshots?.length ? <Screenshots shots={dep.screenshots} /> : null}
            {request.rollback && (
              <div className="rounded-xl border border-warn/40 bg-warn/[0.06] p-3 text-sm">
                <p className="font-medium">Rollback</p>
                <p className="text-muted-foreground">
                  Solicitado por {request.rollback.requestedBy.name ?? request.rollback.requestedBy.email}: {request.rollback.reason}
                </p>
                {request.rollback.approvedBy && <p className="text-muted-foreground">Aprobado por {request.rollback.approvedBy.name ?? request.rollback.approvedBy.email}</p>}
                {request.rollback.revertPrUrl && (
                  <a className="inline-flex items-center gap-1 text-foreground underline" href={request.rollback.revertPrUrl} target="_blank" rel="noreferrer">
                    PR de reversión <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                )}
              </div>
            )}
            {request.status === "deployed" && permissions.includes("deployments.operate") && (
              <div className="space-y-2">
                {!askRollback ? (
                  <button type="button" className="btn-ghost text-warn" onClick={() => setAskRollback(true)}>
                    <Undo2 className="h-4 w-4" aria-hidden="true" /> Solicitar rollback
                  </button>
                ) : (
                  <div className="space-y-2 rounded-xl border border-warn/40 p-3">
                    <p className="text-sm">
                      Se restaura la versión de PROD respaldada antes de este despliegue. Requiere la aprobación de un aprobador con verificación en dos pasos. No revierte datos creados en PROD.
                    </p>
                    <textarea className="field min-h-[72px]" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="¿Por qué hay que revertir?" maxLength={2000} />
                    <div className="flex gap-2">
                      <button type="button" className="btn-primary" disabled={busy === "rollback" || reason.trim().length < 5} onClick={() => void doRollback()}>
                        {busy === "rollback" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />} Enviar solicitud
                      </button>
                      <button type="button" className="btn-ghost" onClick={() => setAskRollback(false)}>
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {tab === "cost" && <CostPanel request={request} />}

        {tab === "evidence" && (
          <div className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              Solicitud original, workflow ejecutado, agentes, prompts permitidos, reglas, resultados, logs saneados, archivos, PR, pruebas, capturas, aprobaciones, despliegue y resultado final.
            </p>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn-ghost" disabled={!!busy} onClick={() => void doExport("html")}>
                {busy === "html" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <FileText className="h-4 w-4" aria-hidden="true" />} HTML
              </button>
              <button type="button" className="btn-ghost" disabled={!!busy} onClick={() => void doExport("html", true)}>
                {busy === "html-pdf" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Printer className="h-4 w-4" aria-hidden="true" />} PDF (imprimir)
              </button>
              <button type="button" className="btn-ghost" disabled={!!busy} onClick={() => void doExport("json")}>
                {busy === "json" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <FileJson className="h-4 w-4" aria-hidden="true" />} JSON
              </button>
            </div>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Download className="h-3 w-3" aria-hidden="true" /> El PDF se genera con «Guardar como PDF» del navegador sobre el HTML exportado.
            </p>
          </div>
        )}
        {error && <p className="text-sm text-bad" role="alert">{error}</p>}
      </div>
    </div>
  );
}
