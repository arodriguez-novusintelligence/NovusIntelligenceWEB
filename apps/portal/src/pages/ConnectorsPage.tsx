import { useEffect, useState } from "react";
import { BrainCircuit, CheckCircle2, Cloud, GitBranch, Loader2, XCircle } from "lucide-react";
import { getConnectors, type ConnectorsInfo } from "@/api/admin";
import { ApiError, type Me } from "@/api/client";

function Ok({ ok }: { ok: boolean }) {
  return ok ? <CheckCircle2 className="h-4 w-4 text-good" aria-label="Conectado" /> : <XCircle className="h-4 w-4 text-bad" aria-label="Con problemas" />;
}

/** Conectores reales de la empresa: motor de IA, GitHub (verificado en vivo) y nube. */
export function ConnectorsPage({ me }: { me: Me }) {
  const [data, setData] = useState<ConnectorsInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    getConnectors()
      .then(setData)
      .catch((e) => setError(e instanceof ApiError ? e.message : "No se pudieron cargar los conectores."));
  }, []);
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="space-y-2 pt-2">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-secondary">Conectores</p>
        <h1 className="text-3xl font-semibold">Sistemas conectados de {me.company.name}</h1>
        <p className="text-muted-foreground">NADF entra solo con los permisos que la empresa otorga. Esta vista verifica en vivo la conexión con GitHub.</p>
      </section>
      {error && <p className="text-sm text-bad">{error}</p>}
      {!data && !error && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Verificando conexiones…
        </p>
      )}
      {data && (
        <>
          <section className="glass flex items-start gap-3 p-4">
            <BrainCircuit className="h-6 w-6 text-secondary" aria-hidden="true" />
            <div className="min-w-0 flex-1 text-sm">
              <p className="flex items-center gap-2 font-semibold">
                Motor de IA <Ok ok={data.engine.ok} />
              </p>
              <p className="text-muted-foreground">
                {data.engine.provider ?? "Claude"} · {data.engine.model ?? "—"}
                {data.engine.keyUpdatedAt ? ` · clave actualizada ${new Date(data.engine.keyUpdatedAt).toLocaleDateString("es-CO")}` : ""} · la clave vive en Secrets Manager y nunca llega al portal.
              </p>
            </div>
          </section>
          {data.apps.map((a) => (
            <section key={a.app.id} className="glass space-y-4 p-5">
              <h2 className="text-lg font-semibold">
                {a.app.name} <span className="text-sm font-normal text-muted-foreground">· {a.app.url}</span>
              </h2>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5 rounded-xl border border-white/10 p-3 text-sm">
                  <p className="flex items-center gap-2 font-medium">
                    <GitBranch className="h-4 w-4" aria-hidden="true" /> GitHub (GitHub App NADF) <Ok ok={a.github.ok} />
                  </p>
                  {a.github.error ? (
                    <p className="text-bad">{a.github.error}</p>
                  ) : (
                    <>
                      <p className="text-muted-foreground">Cuenta: {a.github.account}</p>
                      <p className="text-muted-foreground">Repos con acceso: {a.github.repos?.join(", ")}</p>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(a.github.permissions ?? {}).map(([k, v]) => (
                          <span key={k} className="chip px-2 py-0.5 font-mono text-[10px]">
                            {k}: {v}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <div className="space-y-1.5 rounded-xl border border-white/10 p-3 text-sm">
                  <p className="flex items-center gap-2 font-medium">
                    <Cloud className="h-4 w-4" aria-hidden="true" /> {a.cloud.provider} · {a.cloud.environment} <Ok ok={Boolean(a.cloud.lastVerified)} />
                  </p>
                  <p className="text-muted-foreground">Rol de despliegue: {a.cloud.role} (solo lo asume el ejecutor NADF con external ID)</p>
                  <p className="text-muted-foreground">{a.cloud.lastVerified ? `Verificado en la última ejecución: ${new Date(a.cloud.lastVerified.at ?? "").toLocaleString("es-CO")}` : "Aún no se ha usado en una ejecución."}</p>
                </div>
              </div>
            </section>
          ))}
        </>
      )}
    </div>
  );
}
