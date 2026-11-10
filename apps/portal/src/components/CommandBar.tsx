import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUp, FileText, Image as ImageIcon, Loader2, Paperclip, Sparkles, X } from "lucide-react";
import { listFlows, type FlowTemplate } from "@/api/admin";
import { ACCEPT, uploadAttachment, validateFile, type UploadedAttachment } from "@/api/attachments";
import { ApiError, createRequest, listApps, type ConnectedApp } from "@/api/client";
import { NadfMark } from "./NadfMark";

interface Pending {
  id: string;
  file: File;
  status: "uploading" | "done" | "error";
  uploaded?: UploadedAttachment;
  error?: string;
}

/**
 * Barra de mando: lo que el funcional escribe (más sus adjuntos) se convierte en una solicitud del pipeline PROD.
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
  const [files, setFiles] = useState<Pending[]>([]);
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);

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

  function addFiles(list: FileList | File[]) {
    setMessage(null);
    let count = files.length;
    for (const file of Array.from(list)) {
      const invalid = validateFile(file, count);
      if (invalid) {
        setMessage(invalid);
        continue;
      }
      count += 1;
      const id = `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 7)}`;
      setFiles((f) => [...f, { id, file, status: "uploading" }]);
      uploadAttachment(file)
        .then((uploaded) => setFiles((f) => f.map((p) => (p.id === id ? { ...p, status: "done", uploaded } : p))))
        .catch((e) => setFiles((f) => f.map((p) => (p.id === id ? { ...p, status: "error", error: e instanceof ApiError ? e.message : "No se pudo subir." } : p))));
    }
  }

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
    if (files.some((f) => f.status === "uploading")) {
      setMessage("Espera a que terminen de subir los adjuntos.");
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const attachments = files.filter((f) => f.status === "done" && f.uploaded).map((f) => f.uploaded!);
      const created = await createRequest(text, appId || undefined, flowId || undefined, attachments);
      navigate(`/solicitudes/${created.requestId}`);
    } catch (e) {
      setMessage(e instanceof ApiError ? e.message : "No pude enviar tu solicitud. Intenta de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <form
        onSubmit={submit}
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes("Files")) {
            e.preventDefault();
            setDragging(true);
          }
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          if (!e.dataTransfer.files.length) return;
          e.preventDefault();
          setDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        className={`glass ai-border space-y-2 p-2 pl-4 shadow-glow transition ${dragging ? "ring-2 ring-secondary/60" : ""}`}
      >
        <div className="flex items-end gap-3">
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
            onPaste={(e) => {
              if (e.clipboardData.files.length) {
                e.preventDefault();
                addFiles(e.clipboardData.files);
              }
            }}
            placeholder="Describe el ajuste que quieres en la aplicación… (puedes adjuntar capturas o documentos)"
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
          <button type="button" className="btn-ghost mb-0.5 h-11 w-11 shrink-0 rounded-xl p-0" aria-label="Adjuntar archivos" title="Adjuntar imágenes, .md, .txt, Word (.docx) o PDF" onClick={() => input.current?.click()}>
            <Paperclip className="h-5 w-5" aria-hidden="true" />
          </button>
          <input
            ref={input}
            type="file"
            multiple
            accept={ACCEPT}
            className="hidden"
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <button type="submit" className="btn-primary h-11 w-11 shrink-0 rounded-xl p-0" aria-label="Enviar a NADF" disabled={!value.trim() || busy}>
            {busy ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <ArrowUp className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
        {files.length > 0 && (
          <ul className="flex flex-wrap gap-1.5 pb-1 pr-2" aria-label="Adjuntos">
            {files.map((f) => {
              const Icon = f.file.type.startsWith("image/") ? ImageIcon : FileText;
              return (
                <li key={f.id} className={`chip max-w-[260px] gap-1.5 ${f.status === "error" ? "border-bad/50 text-bad" : ""}`} title={f.error ?? f.file.name}>
                  {f.status === "uploading" ? <Loader2 className="h-3 w-3 shrink-0 animate-spin" aria-hidden="true" /> : <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />}
                  <span className="truncate">{f.file.name}</span>
                  <span className="shrink-0 text-muted-foreground">{Math.max(1, Math.round(f.file.size / 1024))} KB</span>
                  <button type="button" aria-label={`Quitar ${f.file.name}`} className="shrink-0 hover:text-foreground" onClick={() => setFiles((x) => x.filter((p) => p.id !== f.id))}>
                    <X className="h-3 w-3" aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
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
