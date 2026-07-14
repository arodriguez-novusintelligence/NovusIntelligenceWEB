import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { site, heroStats } from "@/content/site";
import { NovusLogo } from "@/components/marketing/NovusLogo";
import { Button } from "@/components/ui/Button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-hero py-24 lg:py-32">
      <div className="absolute inset-0 grid-bg opacity-30" aria-hidden />
      <div className="absolute -left-32 top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" aria-hidden />
      <div className="absolute -right-32 bottom-20 h-64 w-64 rounded-full bg-secondary/15 blur-3xl" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {site.taglineEn}
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Inteligencia que{" "}
              <span className="text-gradient-brand">genera resultados</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              {site.taglineEs}. Diseñamos sistemas multiagente, automatización inteligente e
              integraciones cloud para empresas que necesitan escalar con IA de verdad.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/contact">
                <Button size="lg">
                  Agenda una demo
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/solutions">
                <Button variant="outline" size="lg">
                  Ver soluciones
                </Button>
              </Link>
            </div>
            <dl className="mt-10 flex flex-wrap gap-8">
              {heroStats.map((stat) => (
                <div key={stat.label}>
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground">{stat.label}</dt>
                  <dd className="mt-1 font-display text-xl font-bold text-primary">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="relative animate-novus-float">
              <div className="absolute inset-0 rounded-3xl bg-primary/20 blur-2xl" aria-hidden />
              <NovusLogo size="lg" className="relative h-48 w-48 animate-novus-pulse lg:h-56 lg:w-56" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
