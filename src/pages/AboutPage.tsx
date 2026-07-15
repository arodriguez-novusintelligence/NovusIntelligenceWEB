import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import { PageMetaTags } from "@/components/seo/PageMetaTags";
import { site } from "@/content/site";
import { CTA } from "@/components/sections/CTA";
import { Button } from "@/components/ui/Button";

const VALUES = [
  {
    title: "Nuestra misión",
    body: "Construir inteligencia autónoma que genere ventaja competitiva real para nuestros clientes.",
  },
  {
    title: "Nuestra visión",
    body: "Ser el partner de IA de referencia para empresas de Latinoamérica que operan a nivel global.",
  },
  {
    title: "Nuestros valores",
    body: "Excelencia técnica, ética en IA, foco en resultados y acompañamiento de largo plazo.",
  },
] as const;

export function AboutPage() {
  return (
    <>
      <PageMetaTags
        title="Nosotros — Novus Intelligence Solutions"
        description="Somos Novus Intelligence Solutions. Diseñamos e implementamos soluciones basadas en IA, sistemas multiagente y automatización avanzada."
      />

      <section className="relative overflow-hidden bg-gradient-hero py-24">
        <div className="absolute inset-0 grid-bg opacity-30" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              Sobre nosotros
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">
              Somos <span className="text-gradient-brand">Novus Intelligence Solutions</span>
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Diseñamos e implementamos soluciones basadas en Inteligencia Artificial, sistemas
              multiagénticos y automatización avanzada para transformar procesos, potenciar equipos
              y acelerar el crecimiento de tu empresa.
            </p>
            <p className="mt-4 text-base text-muted-foreground">
              Más inteligencia · más automatización · mejores resultados.
            </p>
          </div>

          <div className="rounded-3xl border border-border/60 bg-gradient-card p-8 shadow-elevated">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              Liderazgo
            </p>
            <h2 className="mt-3 font-display text-2xl font-bold">{site.founder.name}</h2>
            <p className="mt-1 text-sm uppercase tracking-widest text-gradient-brand">
              {site.founder.role}
            </p>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              Ingeniero y emprendedor con foco en arquitecturas inteligentes a escala enterprise.
              Lidera la visión técnica y comercial de Novus desde Bogotá, Colombia.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <a href={`mailto:${site.email}`} className="hover:text-foreground">
                  {site.email}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <a href={site.phoneHref} className="hover:text-foreground">
                  {site.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                {site.city}
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          {VALUES.map((block) => (
            <div
              key={block.title}
              className="rounded-2xl border border-border/60 bg-gradient-card p-6"
            >
              <h3 className="font-display text-xl font-bold">{block.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{block.body}</p>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-12 flex max-w-7xl flex-wrap justify-center gap-3 px-4">
          <Link to="/solutions">
            <Button className="shadow-glow hover:opacity-95">Ver soluciones</Button>
          </Link>
          <Link to="/contact">
            <Button variant="outline" className="border-border bg-card/30 hover:bg-card/60">
              Hablemos
            </Button>
          </Link>
        </div>
      </section>

      <CTA />
    </>
  );
}
