import { cn } from "@/lib/cn";

/** Emblema de NADF: un núcleo con órbita, en el degradado azul–magenta de Novus. */
export function NadfMark({ size = 36, className, animated = true }: { size?: number; className?: string; animated?: boolean }) {
  return (
    <span className={cn("relative inline-flex shrink-0 items-center justify-center", className)} style={{ width: size, height: size }} aria-hidden="true">
      <span className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/40 to-secondary/40 blur-md" />
      <svg viewBox="0 0 64 64" width={size} height={size} className="relative">
        <defs>
          <linearGradient id="nadf-mark-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="hsl(220 85% 60%)" />
            <stop offset="1" stopColor="hsl(295 70% 60%)" />
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="22" fill="none" stroke="url(#nadf-mark-g)" strokeWidth="3" opacity="0.9" />
        <g className={animated ? "origin-center animate-nadf-orbit" : undefined} style={{ transformOrigin: "32px 32px" }}>
          <circle cx="54" cy="32" r="4" fill="hsl(295 70% 62%)" />
          <circle cx="16" cy="16" r="2.6" fill="hsl(220 85% 62%)" />
        </g>
        <circle cx="32" cy="32" r="8" fill="url(#nadf-mark-g)" className={animated ? "animate-nadf-breathe" : undefined} style={{ transformOrigin: "32px 32px" }} />
      </svg>
    </span>
  );
}
