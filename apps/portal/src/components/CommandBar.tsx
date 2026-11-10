import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUp, Loader2, Sparkles } from "lucide-react";
import { listFlows, type FlowTemplate } from "@/api/admin";
import { ApiError, createRequest, listApps, type ConnectedApp } from "@/api/client";
import { NadfMark } from "./NadfMark";

/**
 * Barra de mando: lo que el funcional escribe se convierte en una solicitud del pipeline PROD.
 * Claude la desarrolla, la prueba, publica una vista previa y espera la aprobación humana.
 */
export function CommandBar({ suggestions }: { suggestions: string[] }) {
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [apps, setApps] = useState<ConnectedApp[] | null>(null);
  const [appId, setAppId] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [flows, setFlows] = useState<FlowTemplate[]>([]);
  const [flowId, setFlowId] = useState("");

  useEffect(() => {
    listApps()
      .then((list) => {
        setApps(list);
        setAppId(list[0]?.id ?? "");
      })
      .catch(() => setApps([]));
    listFlows()
      .then((r) => setFlows(r.flows))
      .catch(() => setFlows([]));
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const text = value.trim();
    if (!text || busy) return;
    if (apps && apps.length === 0) {
      setMessage("Tu empresa todavía no tiene una aplicación conectada a NADF. Pídele a Novus que la conecte.");
      return;
    }
    if (text.length < 10) {
      setMessage("Cuéntame un poco más: qué quieres cambiar y dónde se ve.");
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const created = await createRequest(text, appId || undefined, flowId || undefined);
      navigate(`/solicitudes/${created.requestId}`);
    } catch (e) {
      setMessage(e instanceof ApiError ? e.message : "No pude enviar tu solicitud. Intenta de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <form onSubmit={submit} className="glass ai-border flex items-end gap-3 p-2 pl-4 shadow-glow">
        <Sparkles className="mb-3.5 h-5 w-5 shrink-0 text-secondary" aria-hidden="true" />
        <label htmlFor="command" className="sr-only">
          Pídele algo a NADF
        </label>
        <textarea
          id="command"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void submit(e);
            }
          }}
          placeholder="Describe el ajuste que quieres en la aplicación…"
          rows={value.length > 90 ? 3 : 1}
          maxLength={6000}
          className="min-w-0 flex-1 resize-none bg-transparent py-3 text-base text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
        />
        {apps && apps.length > 1 && (
          <select value={appId} onChange={(e) => setAppId(e.target.value)} className="field mb-1 w-auto py-2 text-xs" aria-label="Aplicación">
            {apps.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        )}
        <button type="submit" className="btn-primary h-11 w-11 shrink-0 rounded-xl p-0" aria-label="Enviar a NADF" disabled={!value.trim() || busy}>
          {busy ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <ArrowUp className="h-5 w-5" aria-hidden="true" />}
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        {apps && apps.length === 1 && <span className="text-xs text-muted-foreground">Se aplicará en {apps[0].name} · pipeline PROD con revisión</span>}
        {flows.length > 0 && (
          <label className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            Flujo
            <select value={flowId} onChange={(e) => setFlowId(e.target.value)} className="rounded-lg border border-white/10 bg-white/[0.05] px-2 py-1 text-xs text-foreground" aria-label="Flujo de agentes">
              <option value="">Automático (NADF decide)</option>
              {flows.map((f) => (
                <option key={f.flowId} value={f.flowId}>
                  {f.name}
                </option>
              ))}
            </select>
          </label>
        )}
        {suggestions.map((s) => (
          <button key={s} type="button" onClick={() => setValue(s)} className="chip transition hover:border-primary/50 hover:text-foreground">
            {s}
          </button>
        ))}
      </div>

      {message && (
        <div className="glass flex animate-nadf-rise gap-3 p-4" role="status">
          <NadfMark size={28} />
          <p className="min-w-0 text-sm">{message}</p>
        </div>
      )}
    </div>
  );
}
