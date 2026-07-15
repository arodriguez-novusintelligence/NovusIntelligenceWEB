const partners = [
  { name: "AWS", primary: true },
  { name: "Microsoft Azure", primary: false },
  { name: "Google Cloud", primary: false },
];

export function Partners() {
  return (
    <section className="border-y border-border/60 bg-background py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          Construimos sobre infraestructura cloud de clase mundial
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {partners.map((partner) => (
            <span
              key={partner.name}
              className={
                "font-display text-lg font-bold tracking-tight transition " +
                (partner.primary
                  ? "text-gradient-brand text-xl"
                  : "text-muted-foreground hover:text-foreground")
              }
            >
              {partner.name}
              {partner.primary && (
                <span className="ml-2 rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-primary">
                  Partner principal
                </span>
              )}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
