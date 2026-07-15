import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function CTA() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="absolute inset-0 bg-gradient-hero opacity-80" aria-hidden />
      <div className="absolute inset-0 grid-bg opacity-30" aria-hidden />
      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Empieza hoy</p>
        <h2 className="mt-4 font-display text-3xl font-bold sm:text-5xl">
          Hablemos sobre cómo la IA puede{" "}
          <span className="text-gradient-brand">transformar tu negocio</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground">
          Te acompañamos en el diagnóstico, el diseño y la operación. Una sesión inicial, sin compromiso.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/contact">
            <Button size="lg" className="shadow-glow hover:opacity-95">
              Agenda una demo
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/solutions">
            <Button
              size="lg"
              variant="outline"
              className="border-border bg-card/30 text-foreground hover:bg-card/60"
            >
              Explorar soluciones
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
