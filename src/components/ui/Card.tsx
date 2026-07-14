import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/60 bg-gradient-card p-6 transition hover:border-primary/40 hover:shadow-glow",
        className,
      )}
    >
      {children}
    </div>
  );
}
