import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { solutions } from "@/content/solutions";

export function SolutionsGrid() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              Nuestras soluciones
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
              Inteligencia aplicada para{" "}
              <span className="text-gradient-brand">empresas en evolución</span>
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Seis líneas de producto diseñadas para resolver problemas reales del negocio — desde
            agentes autónomos hasta plataformas de analítica.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {solutions.map((solution) => {
            const Icon = solution.icon;
            return (
              <Link
                key={solution.slug}
                to={`/solutions/${solution.slug}`}
                className="group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-card p-6 shadow-card transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-glow"
              >
                <div className="absolute right-4 top-4 text-muted-foreground opacity-0 transition group-hover:opacity-100">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground">
                  {solution.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {solution.short}
                </p>
                <span className="mt-5 inline-flex items-center text-xs font-semibold uppercase tracking-widest text-primary">
                  Explorar →
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
