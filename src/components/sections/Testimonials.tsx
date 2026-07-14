import { cases } from "@/content/cases";
import { Card } from "@/components/ui/Card";

export function Testimonials() {
  return (
    <section className="border-t border-border/60 py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Casos</p>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
            Resultados que <span className="text-gradient-brand">hablan por sí solos</span>
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {cases.map((caseStudy) => (
            <Card key={caseStudy.id}>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                {caseStudy.industry} · {caseStudy.country}
              </p>
              <h3 className="mt-3 font-display text-xl font-bold">{caseStudy.client}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{caseStudy.challenge}</p>
              <ul className="mt-4 space-y-2">
                {caseStudy.impact.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
