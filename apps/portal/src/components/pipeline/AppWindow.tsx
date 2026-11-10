import { useCallback, useEffect, useRef, useState } from "react";
import { ExternalLink, Loader2, Lock, Maximize2, Minimize2, Monitor, RotateCw, Smartphone } from "lucide-react";
import { ApiError, previewSession } from "@/api/client";
import { cn } from "@/lib/cn";
import { safeRoute } from "@/lib/pipeline";

type Session = Awaited<ReturnType<typeof previewSession>>;

/**
 * Ventana de la aplicación con los cambios: carga la vista previa privada (mismo dominio de PROD, index oculto)
 * y le entrega por postMessage la sesión del usuario admin de la app, así abre ya logueada.
 */
export function AppWindow({ requestId, routes, label }: { requestId: string; routes: string[]; label: string }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [route, setRoute] = useState(safeRoute(routes[0]));
  const [mobile, setMobile] = useState(false);
  const [full, setFull] = useState(false);
  const [nonce, setNonce] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    previewSession(requestId)
      .then((s) => !cancelled && setSession(s))
      .catch((e) => !cancelled && setError(e instanceof ApiError ? e.message : "No pudimos abrir la vista previa."));
    return () => {
      cancelled = true;
    };
  }, [requestId]);

  const send = useCallback(() => {
    if (!session || !frame.current?.contentWindow) return;
    frame.current.contentWindow.postMessage({ type: "nadf-session", ...session.session }, session.appOrigin);
  }, [session]);

  useEffect(() => {
    if (!session) return;
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== session.appOrigin || e.source !== frame.current?.contentWindow) return;
      if ((e.data as { type?: string })?.type === "nadf-preview-ready") {
        send();
        setReady(true);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [session, send]);

  useEffect(() => {
    if (!full) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setFull(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [full]);

  const src = session ? `${session.previewUrl}?ruta=${encodeURIComponent(route)}&v=${nonce}` : undefined;
  const host = session ? new URL(session.appOrigin).host : "";

  return (
    <div className={cn(full ? "fixed inset-0 z-50 flex flex-col bg-background/95 p-3 backdrop-blur" : "space-y-3")}>
      <div className="glass-strong flex flex-wrap items-center gap-2 p-2">
        <div className="flex gap-1.5 pl-1" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-bad/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-warn/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-good/70" />
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-xs text-muted-foreground">
          <Lock className="h-3 w-3 shrink-0 text-good" aria-hidden="true" />
          <span className="truncate">
            {host}
            <span className="text-foreground">{route}</span>
          </span>
          <span className="ml-auto hidden shrink-0 rounded border border-secondary/40 px-1.5 text-[10px] uppercase text-secondary sm:inline">{label}</span>
        </div>
        <div className="flex gap-1">
          <button type="button" className="btn-ghost px-2.5 py-1.5" onClick={() => setMobile((m) => !m)} aria-label={mobile ? "Vista de escritorio" : "Vista móvil"} title={mobile ? "Escritorio" : "Móvil"}>
            {mobile ? <Monitor className="h-4 w-4" aria-hidden="true" /> : <Smartphone className="h-4 w-4" aria-hidden="true" />}
          </button>
          <button type="button" className="btn-ghost px-2.5 py-1.5" onClick={() => { setReady(false); setNonce((n) => n + 1); }} aria-label="Recargar">
            <RotateCw className="h-4 w-4" aria-hidden="true" />
          </button>
          <button type="button" className="btn-ghost px-2.5 py-1.5" onClick={() => setFull((f) => !f)} aria-label={full ? "Salir de pantalla completa" : "Pantalla completa"}>
            {full ? <Minimize2 className="h-4 w-4" aria-hidden="true" /> : <Maximize2 className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {routes.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          {routes.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => { setRoute(safeRoute(r)); setReady(false); setNonce((n) => n + 1); }}
              className={cn("chip transition", safeRoute(r) === route ? "border-secondary/60 text-foreground" : "hover:border-white/25")}
            >
              {r}
            </button>
          ))}
        </div>
      )}

      <div className={cn("relative flex justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/30", full ? "flex-1" : "h-[680px]")}>
        {error ? (
          <p className="m-auto max-w-sm p-6 text-center text-sm text-bad">{error}</p>
        ) : !session ? (
          <p className="m-auto flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Iniciando sesión en la app con el usuario admin…
          </p>
        ) : (
          <>
            <iframe
              key={`${route}-${nonce}`}
              ref={frame}
              src={src}
              title={`Vista previa de la aplicación en ${route}`}
              onLoad={send}
              className={cn("h-full bg-white transition-[width] duration-300", mobile ? "w-[390px] rounded-xl" : "w-full")}
              allow="clipboard-write; geolocation"
            />
            {!ready && (
              <span className="pointer-events-none absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] text-white">
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" /> Abriendo con sesión de admin
              </span>
            )}
          </>
        )}
      </div>
      {session && !full && (
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>Usa datos reales de PROD con el usuario admin de NADF: lo que crees o compres aquí es real.</span>
          <a href={session.appOrigin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-foreground">
            Abrir PROD actual <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        </p>
      )}
    </div>
  );
}
