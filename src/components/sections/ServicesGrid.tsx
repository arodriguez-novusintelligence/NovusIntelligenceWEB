import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { services } from "@/content/services";
import { Card } from "@/components/ui/Card";

export function ServicesGrid() {
  return (
    <section className="py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Servicios</p>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
            Cinco pilares para <span className="text-gradient-brand">transformar tu operación</span>
          </h2>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Card key={service.id} className="group">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 font-display text-xl font-bold">{service.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{service.description}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {service.highlights.map((h) => (
                    <li
                      key={h}
                      className="rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground"
                    >
                      {h}
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>

        <div className="mt-10">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            Ver todos los servicios
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
