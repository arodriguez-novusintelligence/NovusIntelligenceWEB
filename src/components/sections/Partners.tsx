import { partners } from "@/content/cases";

export function Partners() {
  return (
    <section className="border-y border-border/60 bg-navy-surface/40 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          Partners cloud
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className={`font-display text-lg font-semibold ${
                partner.primary ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {partner.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
