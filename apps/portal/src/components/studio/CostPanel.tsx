import { useMemo, useState } from "react";
import { Coins } from "lucide-react";
import type { RequestDetail } from "@/api/client";
import { compactTokens, costBreakdown, usd } from "@/lib/cost";

/**
 * Costo acumulado de la ejecución: cifra destacada + barras por agente (una serie, un solo tono)
 * con detalle al pasar el cursor, y desglose por iteración. La lista de valores sirve también de tabla.
 */
export function CostPanel({ request }: { request: RequestDetail }) {
  const b = useMemo(() => costBreakdown(request.workflow, request.nodeState), [request.workflow, request.nodeState]);
  const [hover, setHover] = useState<string | null>(null);
  const max = Math.max(...b.byNode.map((n) => n.usd), 0.0001);
  const budget = request.workflow?.policy?.budgetUsd ?? null;

  if (!b.byNode.length) {
    return <p className="text-sm text-muted-foreground">Todavía no hay consumo registrado en esta ejecución.</p>;
  }

  return (
    <div className="space-y-5" aria-label="Costo acumulado de la ejecución">
      <div className="flex flex-wrap items-end gap-x-8 gap-y-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Costo acumulado</p>
          <p className="font-display text-4xl font-semibold tabular-nums">{usd(b.total)}</p>
          <p className="text-xs text-muted-foreground">
            {compactTokens(b.tokens.input)} tokens de entrada · {compactTokens(b.tokens.output)} de salida
          </p>
        </div>
        {b.byIteration.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Por iteración</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {b.byIteration.map((it) => (
                <span key={it.iteration} className="chip tabular-nums">
                  Iteración {it.iteration}: {usd(it.usd)}
                </span>
              ))}
            </div>
          </div>
        )}
        {budget != null && (
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Tope de desarrollo por iteración</p>
            <p className="text-sm tabular-nums">{usd(budget)}</p>
          </div>
        )}
      </div>

      <div>
        <h4 className="mb-2 flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
          <Coins className="h-3.5 w-3.5" aria-hidden="true" /> Por agente
        </h4>
        <ul className="space-y-2.5">
          {b.byNode.map((n) => {
            const pct = (n.usd / b.total) * 100;
            return (
              <li
                key={n.nodeId}
                className="relative grid grid-cols-[minmax(0,140px)_1fr_auto] items-center gap-3 rounded-lg px-1 py-1 text-sm hover:bg-white/[0.03]"
                onMouseEnter={() => setHover(n.nodeId)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(n.nodeId)}
                onBlur={() => setHover(null)}
                tabIndex={0}
                aria-label={`${n.label}: ${usd(n.usd)}, ${Math.round(pct)} % del total`}
              >
                <span className="truncate">{n.label}</span>
                <span className="h-2.5 rounded-full bg-white/[0.06]" aria-hidden="true">
                  <span className="block h-full rounded-full bg-primary" style={{ width: `${Math.max(2, (n.usd / max) * 100)}%` }} />
                </span>
                <span className="text-right tabular-nums text-foreground/90">
                  {usd(n.usd)} <span className="text-xs text-muted-foreground">· {Math.round(pct)} %</span>
                </span>
                {hover === n.nodeId && (
                  <span role="tooltip" className="glass-strong absolute right-0 top-full z-20 mt-1 w-64 space-y-0.5 p-3 text-xs shadow-xl">
                    <span className="block font-medium text-foreground">{n.label}</span>
                    <span className="block text-muted-foreground">Modelo: {n.models.join(", ") || "—"}</span>
                    <span className="block text-muted-foreground">Entrada: {compactTokens(n.inputTokens)} tokens</span>
                    <span className="block text-muted-foreground">Salida: {compactTokens(n.outputTokens)} tokens</span>
                    <span className="block text-muted-foreground">Intentos: {n.attempts}</span>
                    {n.estimated && <span className="block text-warn">Estimado con la tarifa oficial (ejecución antigua sin costo guardado).</span>}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      <p className="text-xs text-muted-foreground">
        Claude Code reporta su propio costo; los demás agentes se calculan con la tarifa oficial de Anthropic. Los pasos sin modelo (compilación, vista previa, despliegue) no consumen tokens.
        {b.estimated ? " Algunos valores son estimados." : ""}
      </p>
    </div>
  );
}
