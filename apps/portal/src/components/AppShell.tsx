import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { BadgeCheck, Bot, LogOut, MessagesSquare, Plug, ScrollText, ShieldCheck, Sparkles, Users, type LucideIcon } from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import type { Me } from "@/api/client";
import { config } from "@/config";
import { cn } from "@/lib/cn";
import { ROLE_LABELS, visibleNav, type NavIcon } from "@/lib/navigation";
import { NadfMark } from "./NadfMark";
import { NeuralBackdrop } from "./NeuralBackdrop";

const ICONS: Record<NavIcon, LucideIcon> = {
  command: Sparkles,
  requests: MessagesSquare,
  approvals: BadgeCheck,
  connectors: Plug,
  agents: Bot,
  team: Users,
  governance: ScrollText,
  security: ShieldCheck,
};

export function AppShell({ me, children }: { me: Me; children: ReactNode }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  // Al salir siempre se vuelve al inicio: quien ingrese después no cae en la vista del usuario anterior.
  const exit = async () => {
    navigate("/", { replace: true });
    await logout();
  };
  const items = visibleNav(me.permissions);
  const displayName = me.user.name ?? me.user.email;

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <NeuralBackdrop />
      <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
        <aside className="glass-strong m-3 flex shrink-0 flex-col gap-4 p-4 lg:sticky lg:top-3 lg:h-[calc(100vh-1.5rem)] lg:w-64">
          <div className="flex items-center gap-3 px-1">
            <NadfMark size={34} />
            <div className="min-w-0">
              <p className="font-display text-base font-semibold leading-tight">NADF</p>
              <p className="truncate text-xs text-muted-foreground">Administrador de IA · Novus</p>
            </div>
          </div>

          <nav aria-label="Principal" className="-mx-1 flex gap-1 overflow-x-auto pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:pb-0">
            {items.map((item) => {
              const Icon = ICONS[item.icon];
              if (!item.available) {
                return (
                  <span
                    key={item.id}
                    aria-disabled="true"
                    title={`Disponible en la fase ${item.phase}`}
                    className="flex shrink-0 cursor-default items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground/60"
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    <span className="flex-1 whitespace-nowrap">{item.label}</span>
                    <span className="hidden rounded-md border border-white/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide lg:inline">
                      Fase {item.phase}
                    </span>
                  </span>
                );
              }
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    cn(
                      "flex shrink-0 items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                      isActive
                        ? "ai-border bg-gradient-to-r from-primary/20 to-secondary/10 text-foreground"
                        : "text-foreground/80 hover:bg-white/[0.05] hover:text-foreground",
                    )
                  }
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span className="whitespace-nowrap">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-auto hidden space-y-3 border-t border-white/10 pt-4 lg:block">
            <div className="min-w-0 px-1">
              <p className="truncate text-sm font-medium">{displayName}</p>
              <p className="truncate text-xs text-muted-foreground">{me.company.name}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {me.user.roles.map((r) => (
                  <span key={r} className="chip px-2 py-0.5 text-[11px]">
                    {ROLE_LABELS[r] ?? r}
                  </span>
                ))}
              </div>
            </div>
            <button type="button" onClick={() => void exit()} className="btn-ghost w-full">
              <LogOut className="h-4 w-4" aria-hidden="true" /> Cerrar sesión
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between gap-3 px-4 pt-4 lg:px-8 lg:pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-good/60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-good" />
              </span>
              <span>{me.company.name}</span>
              {config.stage !== "prod" && (
                <span className="rounded-md border border-warn/40 bg-warn/10 px-1.5 py-0.5 font-mono text-[10px] uppercase text-warn">
                  {config.stage}
                </span>
              )}
            </div>
            <button type="button" onClick={() => void exit()} className="btn-ghost px-3 py-2 lg:hidden" aria-label="Cerrar sesión">
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </header>
          <main className="flex-1 px-4 pb-10 pt-4 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
