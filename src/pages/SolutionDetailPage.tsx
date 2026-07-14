import { lazy, Suspense } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { PageMetaTags } from "@/components/seo/PageMetaTags";
import { getRelatedSolutions, getSolution } from "@/content/solutions";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CTA } from "@/components/sections/CTA";

const MultiAgentDemo = lazy(() =>
  import("@/components/sections/MultiAgentDemo").then((m) => ({ default: m.MultiAgentDemo })),
);

export function SolutionDetailPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const solution = getSolution(slug);

  if (!solution) {
    return (
      <>
        <PageMetaTags title="Solución no encontrada — Novus" description="La solución solicitada no existe." />
        <section className="py-32 text-center">
          <h1 className="font-display text-4xl font-bold">Solución no encontrada</h1>
          <p className="mt-4 text-muted-foreground">El slug &quot;{slug}&quot; no corresponde a ningún producto.</p>
          <Link to="/solutions" className="mt-8 inline-block">
            <Button>Volver al catálogo</Button>
          </Link>
        </section>
      </>
    );
  }

  const Icon = solution.icon;
  const related = getRelatedSolutions(slug);
  const showDemo = slug === "ai-agents";

  return (
    <>
      <PageMetaTags title={`${solution.name} — Novus Intelligence Solutions`} description={solution.description} />

      <section className="bg-gradient-hero py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/10">
              <Icon className="h-8 w-8 text-secondary" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Solución</p>
              <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">{solution.name}</h1>
              <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{solution.short}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-2xl font-bold">Descripción</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">{solution.description}</p>
              <h3 className="mt-8 font-display text-xl font-bold">Capacidades</h3>
              <ul className="mt-4 space-y-3">
                {solution.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold">Resultados esperados</h2>
              <ul className="mt-4 space-y-3">
                {solution.outcomes.map((o) => (
                  <li key={o} className="rounded-xl border border-border/60 bg-gradient-card px-4 py-3 text-sm">
                    {o}
                  </li>
                ))}
              </ul>
              <Link to={`/contact?interest=${slug}`} className="mt-8 inline-block">
                <Button size="lg">
                  Solicitar demo
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {showDemo && (
        <Suspense
          fallback={
            <div className="py-20 text-center text-muted-foreground">Cargando demo interactiva…</div>
          }
        >
          <MultiAgentDemo />
        </Suspense>
      )}

      <section className="border-t border-border/60 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold">También te puede interesar</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {related.map((rel) => {
              const RelIcon = rel.icon;
              return (
                <Link key={rel.slug} to={`/solutions/${rel.slug}`}>
                  <Card>
                    <RelIcon className="h-6 w-6 text-primary" />
                    <h3 className="mt-3 font-display font-bold">{rel.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{rel.short}</p>
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
