import { PageMetaTags } from "@/components/seo/PageMetaTags";
import { site } from "@/content/site";
import { CTA } from "@/components/sections/CTA";

export function AboutPage() {
  return (
    <>
      <PageMetaTags
        title="Nosotros — Novus Intelligence Solutions"
        description="Conoce al equipo de Novus Intelligence: misión, visión y liderazgo en soluciones de IA multiagente."
      />
      <section className="bg-gradient-hero py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Nosotros</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold sm:text-5xl">
            Construimos <span className="text-gradient-brand">inteligencia autónoma</span> con propósito
          </h1>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-2xl font-bold">Nuestra misión</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                En {site.name} ayudamos a empresas a adoptar inteligencia artificial de forma
                estratégica, segura y medible. No vendemos promesas: diseñamos sistemas que operan
                en producción, con trazabilidad y gobernanza desde el día uno.
              </p>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Nuestro enfoque combina arquitecturas multiagente, automatización inteligente e
                integración cloud sobre AWS como partner principal, con capacidad multi-cloud cuando
                el negocio lo requiere.
              </p>
            </div>
            <div className="rounded-3xl border border-border/60 bg-gradient-card p-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Liderazgo</p>
              <h3 className="mt-4 font-display text-2xl font-bold">{site.founder.name}</h3>
              <p className="text-primary">{site.founder.role}</p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Fundador con experiencia en arquitecturas de IA empresarial, automatización y
                transformación digital. Lidera la visión técnica y comercial de Novus desde{" "}
                {site.city}.
              </p>
              <dl className="mt-6 space-y-2 text-sm">
                <div>
                  <dt className="text-muted-foreground">Email</dt>
                  <dd>
                    <a href={`mailto:${site.email}`} className="text-primary hover:underline">
                      {site.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Teléfono</dt>
                  <dd>
                    <a href={site.phoneHref} className="text-primary hover:underline">
                      {site.phone}
                    </a>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      <CTA />
    </>
  );
}
