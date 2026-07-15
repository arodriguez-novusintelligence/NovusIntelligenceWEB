import { cn } from "@/utils/cn";

const LOGO_URL = "/assets/novus/logo.jpeg";

interface NovusLogoProps {
  className?: string;
  withWordmark?: boolean;
  size?: number;
}

export function NovusLogo({ className, withWordmark = true, size = 36 }: NovusLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <img
        src={LOGO_URL}
        alt="Novus Intelligence Solutions"
        width={size}
        height={size}
        className="rounded-md object-contain"
        style={{ width: size, height: size }}
      />
      {withWordmark && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-base font-bold tracking-tight text-foreground">
            NOVUS
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-gradient-brand">
            Intelligence
          </span>
        </span>
      )}
    </span>
  );
}
