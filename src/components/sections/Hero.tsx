import { Link } from "react-router-dom";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  NovusDevFrameworkDemo,
  NOVUS_DEMO_EVENT,
} from "@/components/sections/NovusDevFrameworkDemo";

export function Hero() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener(NOVUS_DEMO_EVENT, handler);
    return () => window.removeEventListener(NOVUS_DEMO_EVENT, handler);
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-hero">
      <div className="absolute inset-0 grid-bg opacity-40" aria-hidden />
      <div className="absolute -left-32 top-32 h-72 w-72 rounded-full bg-primary/20 blur-3xl" aria-hidden />
      <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" aria-hidden />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:py-32 lg:px-8">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-3 py-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Building Autonomous Intelligence
          </span>
          <h1 className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Transformamos empresas con{" "}
            <span className="text-gradient-brand">inteligencia que genera resultados</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Diseñamos, implementamos y operamos soluciones basadas en IA, sistemas multiagénticos y
            automatización avanzada para optimizar procesos, reducir costos y acelerar el
            crecimiento de tu empresa.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/contact">
              <Button size="lg">
                Agenda una demo
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-border bg-card/30 text-foreground hover:bg-card/60"
              onClick={() => setOpen(true)}
            >
              <Play className="h-4 w-4" />
              Ver simulación
            </Button>
          </div>

          <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-border/60 pt-6 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-widest text-muted-foreground">
                Partners cloud
              </dt>
              <dd className="mt-1 font-display text-xl font-bold text-foreground">
                AWS · Azure · GCP
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-muted-foreground">Foco</dt>
              <dd className="mt-1 font-display text-xl font-bold text-foreground">
                Enterprise B2B
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-muted-foreground">Sede</dt>
              <dd className="mt-1 font-display text-xl font-bold text-foreground">Bogotá, CO</dd>
            </div>
          </dl>
        </div>

        <div className="relative flex items-center justify-center">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Ver simulación NovusAIDevelopmentFramework"
            className="group relative aspect-square w-full max-w-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <div className="absolute inset-0 animate-novus-pulse rounded-full bg-gradient-brand opacity-30 blur-3xl" />
            <div className="relative flex h-full w-full items-center justify-center rounded-3xl border border-border/60 bg-gradient-card p-8 shadow-elevated transition-transform duration-300 group-hover:scale-[1.02]">
              <img
                src="/assets/novus/logo.jpeg"
                alt="Novus Intelligence Solutions"
                className="animate-novus-float w-3/4 max-w-xs rounded-2xl"
              />
            </div>
          </button>
        </div>
      </div>

      <NovusDevFrameworkDemo open={open} onOpenChange={setOpen} />
    </section>
  );
}
