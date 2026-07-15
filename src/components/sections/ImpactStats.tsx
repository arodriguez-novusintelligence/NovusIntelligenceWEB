import { Rocket, TrendingDown, ShieldCheck, Scaling } from "lucide-react";

const impacts = [
  { icon: Rocket, label: "+ Productividad", desc: "Procesos más rápidos y eficientes." },
  { icon: TrendingDown, label: "− Costos", desc: "Reducción de costos operativos." },
  { icon: ShieldCheck, label: "+ Calidad", desc: "Entregas con mayor calidad y menor riesgo." },
  { icon: Scaling, label: "Escalabilidad", desc: "Soluciones diseñadas para crecer contigo." },
];

export function ImpactStats() {
  return (
    <section className="relative border-y border-border/60 bg-navy-surface/40 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Impacto que generamos
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
            Resultados medibles, no{" "}
            <span className="text-gradient-brand">promesas vacías</span>
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {impacts.map((impact) => {
            const Icon = impact.icon;
            return (
              <div
                key={impact.label}
                className="rounded-2xl border border-border/60 bg-gradient-card p-6"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-semibold">{impact.label}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{impact.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
