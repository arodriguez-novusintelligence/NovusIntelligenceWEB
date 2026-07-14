import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
          variant === "primary" &&
            "bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90",
          variant === "secondary" &&
            "border border-secondary/50 bg-secondary/10 text-secondary hover:bg-secondary/20",
          variant === "outline" &&
            "border border-border/60 bg-background/60 text-foreground hover:border-primary/60 hover:text-primary",
          variant === "ghost" && "text-foreground hover:bg-muted/50",
          size === "sm" && "px-4 py-2 text-xs",
          size === "md" && "px-6 py-2.5 text-sm",
          size === "lg" && "px-8 py-3 text-base",
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
