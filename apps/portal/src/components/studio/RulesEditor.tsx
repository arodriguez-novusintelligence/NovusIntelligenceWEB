import { useEffect, useMemo, useState } from "react";
import { Loader2, Lock, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { ApiError, updateRules, type Rules } from "@/api/client";
import { diffRules } from "@/lib/studio";

/**
 * Reglas del agente: las obligatorias son de solo lectura; las configurables se editan
 * SOLO con el plan listo y antes de ejecutarlo. Cada guardado crea una versión auditada.
 */
export function RulesEditor({
  requestId,
  nodeId,
  rules,
  editable,
  lockedReason,
  onSaved,
}: {
  requestId: string;
  nodeId: string;
  rules?: Rules;
  editable: boolean;
  lockedReason: string;
  onSaved: () => void;
}) {
  const node = rules?.nodes[nodeId];
  const original = useMemo(() => node?.configurable ?? [], [node]);
  const initial = useMemo(() => {
    const first = rules?.history.find((h) => h.nodeId === nodeId);
    return first?.before ?? original;
  }, [rules, nodeId, original]);
  const [draft, setDraft] = useState<string[]>(original);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => setDraft(original), [original]);

  if (!node) return <p className="text-sm text-muted-foreground">Este paso no tiene reglas propias.</p>;

  const diff = diffRules(original, draft.map((d) => d.trim()).filter(Boolean));
  const dirty = diff.added.length > 0 || diff.removed.length > 0;

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await updateRules(requestId, nodeId, draft.map((d) => d.trim()).filter(Boolean));
      onSaved();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudieron guardar las reglas.");
    } finally {
      setBusy(false);
    }
  }

  const history = (rules?.history ?? []).filter((h) => h.nodeId === nodeId);

  return (
    <div className="space-y-4 text-sm">
      <section className="space-y-1.5">
        <h4 className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <Lock className="h-3 w-3" aria-hidden="true" /> Obligatorias (no editables)
        </h4>
        <ul className="space-y-1">
          {node.mandatory.map((m, i) => (
            <li key={i} className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5">
              {m.text}
              <span className="block font-mono text-[10px] text-muted-foreground">{m.source}</span>
            </li>
          ))}
          {!node.mandatory.length && <li className="text-muted-foreground">—</li>}
        </ul>
      </section>

      <section className="space-y-1.5">
        <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Configurables · versión {rules?.version}
          {rules?.locked ? " · congeladas" : ""}
        </h4>
        {!editable && <p className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-muted-foreground">{lockedReason}</p>}
        <ul className="space-y-1.5">
          {draft.map((rule, i) => (
            <li key={i} className="flex gap-1.5">
              {editable ? (
                <>
                  <input
                    className="field py-1.5 text-sm"
                    value={rule}
                    maxLength={300}
                    aria-label={`Regla ${i + 1}`}
                    onChange={(e) => setDraft((d) => d.map((x, j) => (j === i ? e.target.value : x)))}
                  />
                  <button type="button" className="btn-ghost px-2" aria-label="Quitar regla" onClick={() => setDraft((d) => d.filter((_, j) => j !== i))}>
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </>
              ) : (
                <span className="w-full rounded-lg border border-white/10 px-2.5 py-1.5">{rule}</span>
              )}
            </li>
          ))}
          {!draft.length && <li className="text-muted-foreground">Sin reglas configurables.</li>}
        </ul>
        {editable && (
          <div className="flex flex-wrap gap-1.5">
            <button type="button" className="btn-ghost px-2.5 py-1.5 text-xs" onClick={() => setDraft((d) => [...d, ""])} disabled={draft.length >= 20}>
              <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Agregar
            </button>
            <button type="button" className="btn-ghost px-2.5 py-1.5 text-xs" onClick={() => setDraft(initial)}>
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Restaurar configuración inicial
            </button>
          </div>
        )}
      </section>

      {editable && dirty && (
        <section className="space-y-1.5 rounded-xl border border-secondary/40 bg-secondary/[0.06] p-3">
          <h4 className="text-xs font-medium uppercase tracking-wider text-secondary">Comparación (vista previa del cambio)</h4>
          {diff.added.map((a) => (
            <p key={`+${a}`} className="font-mono text-xs text-good">+ {a}</p>
          ))}
          {diff.removed.map((r) => (
            <p key={`-${r}`} className="font-mono text-xs text-bad">− {r}</p>
          ))}
          <button type="button" className="btn-primary px-3 py-1.5 text-xs" disabled={busy} onClick={() => void save()}>
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <Save className="h-3.5 w-3.5" aria-hidden="true" />} Guardar versión {(rules?.version ?? 0) + 1}
          </button>
        </section>
      )}
      {error && <p className="text-xs text-bad" role="alert">{error}</p>}

      {history.length > 0 && (
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer select-none">Auditoría de cambios ({history.length})</summary>
          <ul className="mt-2 space-y-1">
            {history.map((h) => (
              <li key={h.version}>
                v{h.version} · {h.by} · {new Date(h.at).toLocaleString("es-CO")}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
