import { PageMetaTags } from "@/components/seo/PageMetaTags";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { CTA } from "@/components/sections/CTA";

export function ServicesPage() {
  return (
    <>
      <PageMetaTags
        title="Servicios — Novus Intelligence Solutions"
        description="Cinco pilares de servicio: IA, sistemas multiagente, automatización inteligente, integración cloud y analítica avanzada."
      />

      <section className="relative overflow-hidden bg-gradient-hero py-20">
        <div className="absolute inset-0 grid-bg opacity-30" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Servicios</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold sm:text-5xl">
            Cinco capacidades que{" "}
            <span className="text-gradient-brand">construyen ventaja competitiva</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            Combinamos IA, ingeniería cloud y entendimiento de negocio para llevar tus iniciativas de
            la idea a producción — con gobernanza, seguridad y resultados medibles.
          </p>
        </div>
      </section>

      <ServicesGrid heading={false} />
      <CTA />
    </>
  );
}
