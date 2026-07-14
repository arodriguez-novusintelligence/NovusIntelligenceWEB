import { PageMetaTags } from "@/components/seo/PageMetaTags";
import { cases } from "@/content/cases";
import { Card } from "@/components/ui/Card";
import { CTA } from "@/components/sections/CTA";

export function CasesPage() {
  return (
    <>
      <PageMetaTags
        title="Casos de éxito — Novus Intelligence Solutions"
        description="Proyectos reales de IA y automatización: Banco Santa Cruz y doevents.com."
      />
      <section className="bg-gradient-hero py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Casos</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold sm:text-5xl">
            Impacto medible en{" "}
            <span className="text-gradient-brand">industrias reales</span>
          </h1>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8">
            {cases.map((caseStudy) => (
              <Card key={caseStudy.id} className="p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                      {caseStudy.industry} · {caseStudy.country}
                    </p>
                    <h2 className="mt-2 font-display text-2xl font-bold">{caseStudy.client}</h2>
                  </div>
                </div>
                <div className="mt-6 grid gap-6 md:grid-cols-3">
                  <div>
                    <h3 className="text-sm font-semibold text-primary">Reto</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{caseStudy.challenge}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-primary">Solución</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{caseStudy.solution}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-primary">Impacto</h3>
                    <ul className="mt-2 space-y-2">
                      {caseStudy.impact.map((item) => (
                        <li key={item} className="text-sm text-muted-foreground">
                          • {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <CTA />
    </>
  );
}
