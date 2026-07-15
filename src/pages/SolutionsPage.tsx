import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { PageMetaTags } from "@/components/seo/PageMetaTags";
import { solutions } from "@/content/solutions";
import { Card } from "@/components/ui/Card";
import { CTA } from "@/components/sections/CTA";

export function SolutionsPage() {
  return (
    <>
      <PageMetaTags
        title="Soluciones — Novus Intelligence Solutions"
        description="Catálogo de soluciones de IA: agentes autónomos, automatización, integraciones, analítica, documentos y customer AI."
      />
      <section className="bg-gradient-hero py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Soluciones</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold sm:text-5xl">
            Productos de IA listos para{" "}
            <span className="text-gradient-brand">desplegar</span>
          </h1>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {solutions.map((solution) => {
              const Icon = solution.icon;
              return (
                <Link key={solution.slug} to={`/solutions/${solution.slug}`}>
                  <Card className="h-full hover:-translate-y-1">
                    <Icon className="h-8 w-8 text-secondary" />
                    <h2 className="mt-4 font-display text-xl font-bold">{solution.name}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">{solution.short}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                      Ver detalle
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <CTA />
    </>
  );
}
