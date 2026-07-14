import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface CTAProps {
  title?: string;
  description?: string;
  primaryLabel?: string;
  primaryTo?: string;
  secondaryLabel?: string;
  secondaryTo?: string;
}

export function CTA({
  title = "¿Listo para construir inteligencia autónoma?",
  description = "Agenda una sesión con nuestro equipo y descubre cómo los agentes pueden transformar tu operación.",
  primaryLabel = "Agenda una demo",
  primaryTo = "/contact",
  secondaryLabel = "Conoce nuestros servicios",
  secondaryTo = "/services",
}: CTAProps) {
  return (
    <section className="py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-navy-surface to-secondary/10 p-8 sm:p-12 lg:p-16">
          <div className="absolute inset-0 grid-bg opacity-20" aria-hidden />
          <div className="relative max-w-2xl">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">{title}</h2>
            <p className="mt-4 text-lg text-muted-foreground">{description}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to={primaryTo}>
                <Button size="lg">
                  {primaryLabel}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to={secondaryTo}>
                <Button variant="outline" size="lg">
                  {secondaryLabel}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
