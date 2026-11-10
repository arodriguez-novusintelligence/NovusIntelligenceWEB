import { useState } from "react";
import { ExternalLink, GitPullRequest, Loader2, ShieldAlert } from "lucide-react";
import { ApiError, decide, type RequestDetail } from "@/api/client";
import type { Permission } from "@/lib/navigation";
import { DecisionPanel } from "../pipeline/DecisionPanel";
import { TestList } from "../pipeline/ReportCard";

/** Nodo de aprobación: contexto del cambio + las acciones del módulo de aprobaciones existente. */
export function ApprovalNodePanel({ request, permissions, userId, mfaEnabled, onDone }: { request: RequestDetail; permissions: Permission[]; userId: string; mfaEnabled: boolean; onDone: () => void }) {
  const files = request.changedFiles ?? request.report?.archivos ?? [];
  return (
    <div className="space-y-3">
      <div className="space-y-2 rounded-xl border border-white/10 p-3 text-sm">
        <p>
          <span className="text-muted-foreground">Entorno destino:</span> PROD · {request.app?.url}
        </p>
        {request.prUrl && (
          <a href={request.prUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-foreground underline">
            <GitPullRequest className="h-3.5 w-3.5" aria-hidden="true" /> Pull request #{request.prNumber} <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        )}
        {files.length > 0 && (
          <details>
            <summary className="cursor-pointer select-none">Archivos modificados ({files.length})</summary>
            <ul className="mt-1 font-mono text-xs text-muted-foreground">
              {files.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </details>
        )}
        {request.report?.resumen && <p className="text-muted-foreground">{request.report.resumen}</p>}
      </div>
      {request.tests?.length ? <TestList tests={request.tests} /> : null}
      {request.status === "blocked" && request.error && (
        <p className="flex gap-2 rounded-xl border border-bad/40 bg-bad/[0.06] p-3 text-sm">
          <ShieldAlert className="h-4 w-4 shrink-0 text-bad" aria-hidden="true" /> {request.error.message} Este bloqueo de seguridad no se puede saltar.
        </p>
      )}
      <DecisionPanel request={request} permissions={permissions} userId={userId} mfaEnabled={mfaEnabled} onDone={onDone} />
    </div>
  );
}

/** Nodo de rollback: aprobar o rechazar la solicitud de rollback (con MFA). */
export function RollbackNodePanel({ request, permissions, mfaEnabled, onDone }: { request: RequestDetail; permissions: Permission[]; mfaEnabled: boolean; onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!request.rollback) return null;
  const pending = request.status === "rollback_requested";
  async function go(decision: "approve_rollback" | "reject_rollback") {
    setBusy(true);
    setError(null);
    try {
      await decide(request.requestId, decision);
      onDone();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo registrar la decisión.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-3 rounded-xl border border-warn/40 bg-warn/[0.05] p-3 text-sm">
      <p>
        <span className="text-muted-foreground">Motivo:</span> {request.rollback.reason}
      </p>
      <ul className="list-disc space-y-0.5 pl-4 text-xs text-muted-foreground">
        {request.rollback.risks.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
      {pending && permissions.includes("approvals.decide") && (
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-primary" disabled={busy || !mfaEnabled} onClick={() => void go("approve_rollback")}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />} Aprobar rollback
          </button>
          <button type="button" className="btn-ghost" disabled={busy} onClick={() => void go("reject_rollback")}>
            Rechazar
          </button>
          {!mfaEnabled && <p className="w-full text-xs text-warn">Activa la verificación en dos pasos para aprobar acciones sobre PROD.</p>}
        </div>
      )}
      {error && <p className="text-bad" role="alert">{error}</p>}
    </div>
  );
}
