import { PageMetaTags } from "@/components/seo/PageMetaTags";
import { services } from "@/content/services";
import { Card } from "@/components/ui/Card";
import { CTA } from "@/components/sections/CTA";

export function ServicesPage() {
  return (
    <>
      <PageMetaTags
        title="Servicios — Novus Intelligence Solutions"
        description="Cinco pilares de servicios de IA: inteligencia artificial, sistemas multiagente, automatización, cloud e analítica avanzada."
      />
      <section className="bg-gradient-hero py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Servicios</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold sm:text-5xl">
            Expertise integral en{" "}
            <span className="text-gradient-brand">inteligencia artificial</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            Desde estrategia hasta operación: acompañamos cada fase del ciclo de vida de tus
            iniciativas de IA.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <Card key={service.id}>
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-display text-2xl font-bold">{service.title}</h2>
                      <p className="mt-2 text-muted-foreground">{service.description}</p>
                      <ul className="mt-4 flex flex-wrap gap-2">
                        {service.highlights.map((h) => (
                          <li
                            key={h}
                            className="rounded-full border border-border/60 px-3 py-1 text-xs"
                          >
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <CTA />
    </>
  );
}
