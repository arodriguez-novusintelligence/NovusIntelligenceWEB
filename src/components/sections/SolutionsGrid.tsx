import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { solutions } from "@/content/solutions";
import { Card } from "@/components/ui/Card";

export function SolutionsGrid() {
  return (
    <section className="border-t border-border/60 bg-navy-surface/40 py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Soluciones</p>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
            Productos listos para <span className="text-gradient-brand">impacto inmediato</span>
          </h2>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {solutions.map((solution) => {
            const Icon = solution.icon;
            return (
              <Link key={solution.slug} to={`/solutions/${solution.slug}`} className="block">
                <Card className="h-full transition-transform hover:-translate-y-1">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10">
                    <Icon className="h-6 w-6 text-secondary" />
                  </div>
                  <h3 className="mt-4 font-display text-xl font-bold">{solution.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{solution.short}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                    Explorar
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="mt-10">
          <Link
            to="/solutions"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            Ver catálogo completo
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
