import { useState } from "react";
import { CheckCircle2, CircleHelp, CircleMinus, CircleSlash, ShieldAlert, TriangleAlert, X, XCircle } from "lucide-react";
import type { Report, TestResult } from "@/api/client";
import { cn } from "@/lib/cn";

function Section({ title, items, icon: Icon, tone }: { title: string; items?: string[]; icon: typeof CheckCircle2; tone: string }) {
  if (!items?.length) return null;
  return (
    <div className="space-y-1.5">
      <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</h3>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-sm">
            <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", tone)} aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Informe del agente para el funcional y el aprobador. */
export function ReportCard({ report }: { report?: Report }) {
  if (!report) return null;
  return (
    <div className="space-y-4">
      {report.resumen && <p className="text-[15px] leading-relaxed text-foreground/95">{report.resumen}</p>}
      {report.riesgo && (
        <p className="flex items-center gap-2 text-sm">
          <ShieldAlert className="h-4 w-4 text-secondary" aria-hidden="true" />
          Riesgo estimado: <span className="font-medium">{report.riesgo}</span>
        </p>
      )}
      <Section title="Hecho" items={report.hecho} icon={CheckCircle2} tone="text-good" />
      <Section title="No hecho" items={report.no_hecho} icon={CircleSlash} tone="text-warn" />
      <Section title="Limitaciones" items={report.limitaciones} icon={TriangleAlert} tone="text-warn" />
      <Section title="Qué revisar en la vista previa" items={report.pruebas_sugeridas} icon={CircleMinus} tone="text-primary" />
      <Section title="Preguntas del agente" items={report.preguntas} icon={CircleHelp} tone="text-secondary" />
      {report.archivos?.length ? (
        <details className="text-sm text-muted-foreground">
          <summary className="cursor-pointer select-none">Archivos modificados ({report.archivos.length})</summary>
          <ul className="mt-2 space-y-0.5 font-mono text-xs">
            {report.archivos.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}

const TEST_ICON = { passed: CheckCircle2, failed: XCircle, warning: TriangleAlert, skipped: CircleMinus } as const;
const TEST_TONE = { passed: "text-good", failed: "text-bad", warning: "text-warn", skipped: "text-muted-foreground" } as const;

export function TestList({ tests }: { tests?: TestResult[] }) {
  if (!tests?.length) return <p className="text-sm text-muted-foreground">Aún no hay pruebas.</p>;
  return (
    <ul className="space-y-2">
      {tests.map((t, i) => {
        const Icon = TEST_ICON[t.status];
        return (
          <li key={i} className="flex gap-2.5 text-sm">
            <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", TEST_TONE[t.status])} aria-hidden="true" />
            <div className="min-w-0">
              <p>{t.name}</p>
              {t.detail && <p className="break-words text-xs text-muted-foreground">{t.detail}</p>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function Screenshots({ shots }: { shots: { label: string; url: string }[] }) {
  const [open, setOpen] = useState<{ label: string; url: string } | null>(null);
  if (!shots.length) return null;
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {shots.map((s) => (
          <button key={s.url} type="button" onClick={() => setOpen(s)} className="group overflow-hidden rounded-xl border border-white/10 text-left">
            <img src={s.url} alt={`Captura: ${s.label}`} className="aspect-[16/10] w-full object-cover object-top transition group-hover:scale-[1.02]" loading="lazy" />
            <span className="block truncate px-2 py-1.5 text-xs text-muted-foreground">{s.label}</span>
          </button>
        ))}
      </div>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" role="dialog" aria-label={open.label} onClick={() => setOpen(null)}>
          <button type="button" className="btn-ghost absolute right-4 top-4 bg-black/40" aria-label="Cerrar" onClick={() => setOpen(null)}>
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
          <img src={open.url} alt={`Captura: ${open.label}`} className="max-h-full max-w-full rounded-xl" />
        </div>
      )}
    </>
  );
}
