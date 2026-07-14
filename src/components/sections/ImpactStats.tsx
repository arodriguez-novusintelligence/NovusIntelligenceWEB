import { impactStats } from "@/content/site";

export function ImpactStats() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border/60 bg-gradient-card p-8 sm:p-12">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Impacto
          </p>
          <dl className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-4">
            {impactStats.map((stat) => (
              <div key={stat.label} className="text-center">
                <dt className="font-display text-3xl font-bold text-gradient-brand sm:text-4xl">
                  {stat.value}
                </dt>
                <dd className="mt-2 text-sm text-muted-foreground">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
