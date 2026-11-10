import { useState, type FormEvent } from "react";
import { ArrowUp, Sparkles } from "lucide-react";
import { NadfMark } from "./NadfMark";

/**
 * Barra de mando. En la fase 0 el asistente NADF aún no está conectado:
 * la barra lo dice con claridad en lugar de simular una respuesta.
 */
export function CommandBar({ suggestions }: { suggestions: string[] }) {
  const [value, setValue] = useState("");
  const [lastAsk, setLastAsk] = useState<string | null>(null);

  function submit(event: FormEvent) {
    event.preventDefault();
    const text = value.trim();
    if (!text) return;
    setLastAsk(text);
    setValue("");
  }

  return (
    <div className="space-y-3">
      <form onSubmit={submit} className="glass ai-border flex items-center gap-3 p-2 pl-4 shadow-glow">
        <Sparkles className="h-5 w-5 shrink-0 text-secondary" aria-hidden="true" />
        <label htmlFor="command" className="sr-only">
          Pídele algo a NADF
        </label>
        <input
          id="command"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="¿Qué quieres que haga la IA hoy?"
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent py-3 text-base text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
        />
        <button type="submit" className="btn-primary h-11 w-11 shrink-0 rounded-xl p-0" aria-label="Enviar a NADF" disabled={!value.trim()}>
          <ArrowUp className="h-5 w-5" aria-hidden="true" />
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button key={s} type="button" onClick={() => setValue(s)} className="chip transition hover:border-primary/50 hover:text-foreground">
            {s}
          </button>
        ))}
      </div>

      {lastAsk && (
        <div className="glass flex animate-nadf-rise gap-3 p-4" role="status">
          <NadfMark size={28} />
          <div className="min-w-0 space-y-1 text-sm">
            <p className="text-muted-foreground">
              Pediste: <span className="text-foreground">«{lastAsk}»</span>
            </p>
            <p>
              Todavía no puedo ejecutar pedidos: el asistente NADF se conecta en la <strong>fase 1</strong>, junto con los conectores y la
              gestión del equipo. Hoy ya puedes revisar tu perfil y activar la verificación en dos pasos.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
