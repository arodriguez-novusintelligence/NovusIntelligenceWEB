import { cn } from "@/utils/cn";

interface NovusLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function NovusLogo({ className, size = "md" }: NovusLogoProps) {
  const sizes = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-20 w-20",
  };

  return (
    <img
      src="/assets/novus/logo.svg"
      alt="Novus Intelligence Solutions"
      className={cn("rounded-xl object-cover shadow-glow", sizes[size], className)}
    />
  );
}
