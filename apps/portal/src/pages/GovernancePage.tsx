import { useEffect, useState } from "react";
import { Gavel, Loader2, ScrollText, ShieldCheck, Wallet } from "lucide-react";
import { getGovernance, type GovernanceInfo } from "@/api/admin";
import { ApiError, type Me } from "@/api/client";
import { STATUS } from "@/lib/pipeline";

const ACTION_LABEL: Record<string, string> = {
  "user.created": "Invitó a una persona",
  "user.updated": "Cambió un usuario",
  "user.reinvited": "Reenvió una invitación",
  "company.updated": "Actualizó la empresa",
  "agent.defined": "Ajustó un agente (solo la empresa)",
  "flow.created": "Creó un flujo",
  "flow.updated": "Actualizó un flujo",
  "flow.archived": "Archivó un flujo",
  "plan.approved": "Aprobó un plan (gate plan)",
  "deploy.approve": "Aprobó un despliegue a PROD",
  "deploy.reject": "Rechazó un despliegue",
  "deploy.changes": "Pidió ajustes",
  "rollback.requested": "Solicitó un rollback",
};

/** Gobierno: políticas obligatorias, modelo de aprobación, auditoría y consumo. */
export function GovernancePage({ me }: { me: Me }) {
  const [data, setData] = useState<GovernanceInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    getGovernance()
      .then(setData)
      .catch((e) => setError(e instanceof ApiError ? e.message : "No se pudo cargar el gobierno."));
  }, []);
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="space-y-2 pt-2">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-secondary">Gobierno</p>
        <h1 className="text-3xl font-semibold">Control y auditoría de {me.company.name}</h1>
        <p className="text-muted-foreground">Las reglas que la IA no puede saltarse, quién aprueba qué, lo que pasó y cuánto se consumió.</p>
      </section>
      {error && <p className="text-sm text-bad">{error}</p>}
      {!data && !error && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Cargando…
        </p>
      )}
      {data && (
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="glass space-y-3 p-5">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <ShieldCheck className="h-5 w-5 text-secondary" aria-hidden="true" /> Políticas obligatorias
            </h2>
            <ul className="space-y-1.5 text-sm">
              {data.policies.map((p) => (
                <li key={p} className="rounded-lg border border-white/10 px-3 py-2">
                  {p}
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground">Framework {data.framework.branch}@{data.framework.sha?.slice(0, 7)}. No se editan desde el portal.</p>
          </section>
          <section className="glass space-y-3 p-5">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Gavel className="h-5 w-5 text-secondary" aria-hidden="true" /> Modelo de aprobación ({data.approvalModel.policy})
            </h2>
            <ul className="space-y-1 text-sm">
              {data.approvalModel.gates.map((g) => (
                <li key={g.id} className="flex justify-between gap-3 border-b border-white/5 py-1">
                  <span className="font-mono text-xs">{g.id}</span>
                  <span className="text-muted-foreground">{g.required ? "Siempre" : `Si ${g.required_when}`} · {g.owner}</span>
                </li>
              ))}
            </ul>
            <ul className="list-disc space-y-0.5 pl-5 text-xs text-muted-foreground">
              {data.approvalModel.invariants.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </section>
          <section className="glass space-y-3 p-5">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Wallet className="h-5 w-5 text-secondary" aria-hidden="true" /> Consumo
            </h2>
            <p className="text-3xl font-semibold">{data.usage.costUsd.toFixed(2)} USD</p>
            <p className="text-xs text-muted-foreground">{data.usage.costNote}</p>
            {data.usage.byRequest?.length ? (
              <ul className="space-y-2" aria-label="Costo por solicitud">
                {data.usage.byRequest.map((r) => (
                  <li key={r.requestId} className="grid grid-cols-[minmax(0,1fr)_120px_auto] items-center gap-3 text-sm">
                    <a href={`/solicitudes/${r.requestId}`} className="truncate hover:underline" title={r.title}>
                      {r.title}
                    </a>
                    <span className="h-2.5 rounded-full bg-white/[0.06]" aria-hidden="true">
                      <span className="block h-full rounded-full bg-primary" style={{ width: `${Math.max(2, (r.usd / data.usage.byRequest![0].usd) * 100)}%` }} />
                    </span>
                    <span className="text-right tabular-nums">{r.usd.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</span>
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="flex flex-wrap gap-1.5">
              <span className="chip">{data.usage.requests} solicitudes</span>
              {Object.entries(data.usage.byStatus).map(([k, v]) => (
                <span key={k} className="chip">
                  {STATUS[k as keyof typeof STATUS]?.label ?? k}: {v}
                </span>
              ))}
            </div>
          </section>
          <section className="glass space-y-3 p-5 lg:row-span-2">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <ScrollText className="h-5 w-5 text-secondary" aria-hidden="true" /> Auditoría
            </h2>
            <ul className="max-h-[520px] space-y-1.5 overflow-y-auto text-sm">
              {data.audit.map((a, i) => (
                <li key={i} className="rounded-lg border border-white/10 px-3 py-2">
                  <p>
                    <strong>{a.by?.name ?? a.by?.email}</strong> · {ACTION_LABEL[a.action] ?? a.action}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(a.at).toLocaleString("es-CO")} · {String(a.detail?.title ?? a.detail?.email ?? a.detail?.name ?? a.detail?.agentId ?? "")}
                  </p>
                </li>
              ))}
              {!data.audit.length && <li className="text-muted-foreground">Sin eventos todavía.</li>}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
