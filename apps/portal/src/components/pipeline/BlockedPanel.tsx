import { useState } from "react";
import { Ban, Globe, Loader2, RotateCw, ShieldAlert, ShieldCheck, Wand2 } from "lucide-react";
import { cancelRequest } from "@/api/admin";
import { ApiError, decide, type RequestDetail } from "@/api/client";
import { blockKind, type BlockKind as Kind } from "@/lib/blocks";
import type { Permission } from "@/lib/navigation";

const EXPLAIN: Record<Kind, string> = {
  review: "Un agente de revisión encontró problemas en el cambio. Puedes pedir a la IA que los corrija (reutiliza el trabajo hecho) o, si eres aprobador, aceptar el riesgo con una justificación: queda en la auditoría y en el PR, y aún hará falta aprobar el despliegue a PROD.",
  plan_backend: "El pedido necesita cambios en el backend y en este pipeline solo está conectada la web. Se detuvo antes de gastar. Puedes continuar solo con la parte web (protegida con un feature flag si depende del backend) o aclarar el pedido.",
  plan_other: "El Analista necesita más información para hacerlo con seguridad. Aclara el pedido y NADF vuelve a planificar.",
  prod: "PROD tiene cambios que no están en main. Continuar revertiría el trabajo de otras personas, así que este bloqueo no se puede omitir. Publica esos cambios en main y reintenta.",
  secret: "Se detectaron posibles secretos en el cambio. Este bloqueo no se puede omitir: pide a la IA que lo corrija.",
  other: "La ejecución se detuvo. Puedes reintentar o cancelar.",
};

/** Decisión humana sobre un bloqueo: corregir, aceptar riesgo, cambiar alcance, reintentar o cancelar. */
export function BlockedPanel({ request, permissions, userId, mfaEnabled, onDone }: { request: RequestDetail; permissions: Permission[]; userId: string; mfaEnabled: boolean; onDone: () => void }) {
  const kind = blockKind(request);
  const approver = permissions.includes("approvals.decide");
  const owner = permissions.includes("requests.create") && request.createdBy.id === userId;
  const canAct = approver || owner || permissions.includes("deployments.operate");
  const [mode, setMode] = useState<"fix" | "accept" | "web" | "clarify" | "cancel" | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!canAct) return null;

  const findings = request.error?.message?.replace(/^El Revisor bloqueó el cambio: |^Seguridad bloqueó el cambio: /, "") ?? "";

  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
      setMode(null);
      setText("");
      onDone();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo registrar la decisión.");
    } finally {
      setBusy(false);
    }
  }

  const open = (m: typeof mode, prefill = "") => {
    setMode(m);
    setText(prefill);
    setError(null);
  };

  return (
    <section className="glass space-y-3 border-warn/40 p-4" aria-labelledby="blocked-title">
      <h2 id="blocked-title" className="flex items-center gap-2 text-base font-semibold">
        <ShieldAlert className="h-5 w-5 text-warn" aria-hidden="true" /> ¿Qué hacemos con el bloqueo?
      </h2>
      <p className="text-sm text-muted-foreground">{EXPLAIN[kind]}</p>

      {!mode && (
        <div className="flex flex-wrap gap-2">
          {(kind === "review" || kind === "secret") && (
            <button type="button" className="btn-primary" onClick={() => open("fix", `Corrige lo que señaló la revisión: ${findings}`)}>
              <Wand2 className="h-4 w-4" aria-hidden="true" /> Corregir con la IA
            </button>
          )}
          {kind === "review" && approver && (
            <button type="button" className="btn-ghost text-warn" disabled={!mfaEnabled} title={mfaEnabled ? undefined : "Activa la verificación en dos pasos"} onClick={() => open("accept")}>
              <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Aceptar el riesgo y continuar
            </button>
          )}
          {kind === "plan_backend" && (
            <button type="button" className="btn-primary" onClick={() => open("web", "Implementa solo la parte web; si depende del backend, protégela con un feature flag apagado.")}>
              <Globe className="h-4 w-4" aria-hidden="true" /> Continuar solo con la parte web
            </button>
          )}
          {(kind === "plan_backend" || kind === "plan_other") && (
            <button type="button" className="btn-ghost" onClick={() => open("clarify")}>
              Aclarar y volver a planificar
            </button>
          )}
          {(kind === "prod" || kind === "other") && (
            <button type="button" className="btn-primary" disabled={busy} onClick={() => void run(() => decide(request.requestId, "changes"))}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <RotateCw className="h-4 w-4" aria-hidden="true" />} Reintentar
            </button>
          )}
          <button type="button" className="btn-ghost text-bad" onClick={() => open("cancel")}>
            <Ban className="h-4 w-4" aria-hidden="true" /> Cancelar solicitud
          </button>
        </div>
      )}

      {mode && mode !== "cancel" && (
        <div className="space-y-2">
          <label htmlFor="blocked-text" className="text-sm font-medium">
            {mode === "accept" ? "¿Por qué aceptas el riesgo? (queda en la auditoría y en el PR)" : mode === "fix" ? "Indicaciones para la IA (puedes editarlas)" : mode === "web" ? "Alcance acordado" : "Aclaración para el Analista"}
          </label>
          <textarea id="blocked-text" className="field min-h-[96px] text-sm" value={text} maxLength={4000} onChange={(e) => setText(e.target.value)} />
          {mode === "accept" && <p className="text-xs text-muted-foreground">Se abrirá el PR con el riesgo documentado. El despliegue a PROD seguirá necesitando su propia aprobación.</p>}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-primary"
              disabled={busy || (mode === "accept" && text.trim().length < 15) || ((mode === "fix" || mode === "clarify") && !text.trim())}
              onClick={() =>
                void run(() =>
                  mode === "accept" ? decide(request.requestId, "accept_risk", text.trim()) : mode === "web" ? decide(request.requestId, "web_only", text.trim()) : decide(request.requestId, "changes", text.trim()),
                )
              }
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {mode === "accept" ? "Aceptar riesgo y continuar" : mode === "web" ? "Continuar solo web" : "Enviar"}
            </button>
            <button type="button" className="btn-ghost" disabled={busy} onClick={() => setMode(null)}>
              Volver
            </button>
          </div>
        </div>
      )}

      {mode === "cancel" && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span>¿Cancelar la solicitud definitivamente?</span>
          <button type="button" className="btn-ghost text-bad" disabled={busy} onClick={() => void run(() => cancelRequest(request.requestId, "Cancelada tras un bloqueo"))}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />} Sí, cancelar
          </button>
          <button type="button" className="btn-ghost" disabled={busy} onClick={() => setMode(null)}>
            Volver
          </button>
        </div>
      )}
      {error && <p className="text-sm text-bad" role="alert">{error}</p>}
    </section>
  );
}
