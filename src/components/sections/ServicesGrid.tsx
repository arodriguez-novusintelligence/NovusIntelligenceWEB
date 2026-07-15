import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { services } from "@/content/services";

interface ServicesGridProps {
  heading?: boolean;
}

export function ServicesGrid({ heading = true }: ServicesGridProps) {
  return (
    <section className="relative border-y border-border/60 bg-navy-surface/40 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {heading && (
          <div className="mb-12 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              Pilares de servicio
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
              Cinco capacidades que{" "}
              <span className="text-gradient-brand">mueven la aguja</span>
            </h2>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <article
                key={service.id}
                id={service.id}
                className="group rounded-2xl border border-border/60 bg-gradient-card p-6 shadow-card transition hover:border-primary/50 hover:shadow-glow"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {service.description}
                </p>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {service.highlights.map((h) => (
                    <li
                      key={h}
                      className="rounded-full border border-border bg-background/60 px-2.5 py-0.5 text-[11px] text-muted-foreground"
                    >
                      {h}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>

        {heading && (
          <div className="mt-10">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              Ver todos los servicios
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
