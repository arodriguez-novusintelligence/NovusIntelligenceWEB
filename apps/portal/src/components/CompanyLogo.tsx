import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { getCompany, uploadCompanyLogo, type CompanyProfile } from "@/api/admin";
import { ApiError } from "@/api/client";
import { cn } from "@/lib/cn";

let shared: Promise<CompanyProfile> | null = null;
const listeners = new Set<(c: CompanyProfile) => void>();

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Logo de la empresa junto a su nombre; quien administra la empresa puede subirlo con un clic. */
export function CompanyLogo({ name, canManage, size = 28, className }: { name: string; canManage: boolean; size?: number; className?: string }) {
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    shared ??= getCompany();
    shared.then(setCompany).catch(() => (shared = null));
    listeners.add(setCompany);
    return () => {
      listeners.delete(setCompany);
    };
  }, []);

  async function onFile(file?: File) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const c = await uploadCompanyLogo(file);
      shared = Promise.resolve(c);
      listeners.forEach((l) => l(c));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo subir el logo.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  const box = (
    <span
      className={cn("relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/15 bg-white/[0.06] font-display text-[11px] font-semibold text-foreground/90", className)}
      style={{ width: size, height: size }}
    >
      {company?.logoUrl ? <img src={company.logoUrl} alt={`Logo de ${name}`} className="h-full w-full object-contain" /> : initials(name)}
      {busy && (
        <span className="absolute inset-0 flex items-center justify-center bg-black/60">
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        </span>
      )}
    </span>
  );

  if (!canManage) return box;
  return (
    <span className="group relative inline-flex" title={error ?? "Cambiar el logo de la empresa (PNG, JPG o WEBP, hasta 512 KB)"}>
      <button type="button" className="relative rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary" onClick={() => input.current?.click()} aria-label="Cambiar el logo de la empresa">
        {box}
        <span className="absolute -bottom-1 -right-1 hidden rounded-full bg-secondary p-0.5 text-white group-hover:block">
          <ImagePlus className="h-2.5 w-2.5" aria-hidden="true" />
        </span>
      </button>
      <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => void onFile(e.target.files?.[0])} />
      {error && <span className="absolute left-0 top-full z-20 mt-1 w-56 rounded-lg bg-bad/90 px-2 py-1 text-[11px] text-white">{error}</span>}
    </span>
  );
}
