import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, MessageSquarePlus, Rocket, ShieldAlert, ThumbsDown } from "lucide-react";
import { ApiError, decide, type RequestDetail } from "@/api/client";
import type { Permission } from "@/lib/navigation";

/**
 * Decisión humana sobre el pipeline PROD.
 * - Aprobador/Admin: aprobar (con MFA) y desplegar, pedir ajustes o rechazar.
 * - Quien pidió el cambio: pedir ajustes o reintentar.
 */
export function DecisionPanel({
  request,
  permissions,
  userId,
  mfaEnabled,
  onDone,
}: {
  request: RequestDetail;
  permissions: Permission[];
  userId: string;
  mfaEnabled: boolean;
  onDone: () => void;
}) {
  const [mode, setMode] = useState<"idle" | "approve" | "changes" | "reject">("idle");
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const approver = permissions.includes("approvals.decide");
  const owner = permissions.includes("requests.create") && request.createdBy.id === userId;
  const reviewing = request.status === "awaiting_approval";
  // Los bloqueos tienen su propio panel (BlockedPanel) con opciones según el tipo.
  const retryable = ["no_changes", "failed", "rolled_back"].includes(request.status);
  if (!(reviewing || retryable) || !(approver || owner)) return null;

  async function submit(decision: "approve" | "reject" | "changes") {
    setBusy(true);
    setError(null);
    try {
      await decide(request.requestId, decision, comment.trim() || undefined);
      setMode("idle");
      setComment("");
      onDone();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No pudimos registrar la decisión.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="glass ai-border space-y-4 p-5" aria-labelledby="decision-title">
      <div>
        <h2 id="decision-title" className="text-lg font-semibold">
          {reviewing ? "Tu decisión" : "¿Qué hacemos ahora?"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {reviewing
            ? "Nada llega a producción sin tu aprobación. Revisa la ventana de la app, el informe y las pruebas."
            : "Puedes pedirle al agente que lo intente de nuevo, con indicaciones si quieres."}
        </p>
      </div>

      {reviewing && approver && !mfaEnabled && (
        <div className="flex items-start gap-3 rounded-xl border border-warn/40 bg-warn/10 p-3 text-sm">
          <ShieldAlert className="h-5 w-5 shrink-0 text-warn" aria-hidden="true" />
          <p>
            Para aprobar un despliegue a PROD necesitas la verificación en dos pasos.{" "}
            <Link to="/seguridad" className="font-medium underline">
              Actívala aquí
            </Link>
            .
          </p>
        </div>
      )}

      {mode === "idle" && (
        <div className="flex flex-wrap gap-2">
          {reviewing && approver && (
            <button type="button" className="btn-primary" disabled={!mfaEnabled} onClick={() => setMode("approve")}>
              <Rocket className="h-4 w-4" aria-hidden="true" /> Aprobar y desplegar en PROD
            </button>
          )}
          <button type="button" className="btn-ghost" onClick={() => setMode("changes")}>
            <MessageSquarePlus className="h-4 w-4" aria-hidden="true" /> {reviewing ? "Pedir ajustes" : "Reintentar"}
          </button>
          {approver && (reviewing || retryable) && (
            <button type="button" className="btn-ghost text-bad hover:border-bad/40" onClick={() => setMode("reject")}>
              <ThumbsDown className="h-4 w-4" aria-hidden="true" /> {reviewing ? "Rechazar" : "Cerrar solicitud"}
            </button>
          )}
        </div>
      )}

      {mode === "approve" && (
        <div className="space-y-3 rounded-xl border border-secondary/40 bg-secondary/10 p-4">
          <p className="text-sm">
            Vas a publicar este cambio en <strong>{request.app?.url ?? "producción"}</strong>. NADF verificará que PROD no cambió desde la revisión,
            hará un respaldo, desplegará, probará con el usuario admin y volverá atrás solo si algo falla.
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-primary" disabled={busy} onClick={() => void submit("approve")}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Rocket className="h-4 w-4" aria-hidden="true" />} Sí, desplegar en PROD
            </button>
            <button type="button" className="btn-ghost" disabled={busy} onClick={() => setMode("idle")}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {(mode === "changes" || mode === "reject") && (
        <div className="space-y-3">
          <label htmlFor="decision-comment" className="text-sm font-medium">
            {mode === "changes" ? "¿Qué debe ajustar el agente?" : "Motivo (opcional)"}
          </label>
          <textarea
            id="decision-comment"
            className="field min-h-[96px]"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={mode === "changes" ? "Ej.: el botón debe quedar debajo del precio y en color azul" : ""}
            maxLength={4000}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-primary"
              disabled={busy || (mode === "changes" && reviewing && !comment.trim())}
              onClick={() => void submit(mode === "changes" ? "changes" : "reject")}
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {mode === "changes" ? "Enviar al agente" : "Confirmar"}
            </button>
            <button type="button" className="btn-ghost" disabled={busy} onClick={() => setMode("idle")}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-bad" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
