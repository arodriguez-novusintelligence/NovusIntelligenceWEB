import { cases } from "@/content/cases";
import { Globe, MapPin, Building2, ArrowUpRight } from "lucide-react";

const logos: Record<string, { src: string; alt: string; website?: string }> = {
  "banco-santa-cruz": {
    src: "/assets/logos/banco-santa-cruz.png",
    alt: "Logo Banco Santa Cruz",
    website: "bancosantacruz.com.do",
  },
  doevents: {
    src: "/assets/logos/doevents.jpg",
    alt: "Logo doevents",
    website: "doevents.com",
  },
};

export function Testimonials() {
  return (
    <section className="relative overflow-hidden py-24">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.98 0.005 240) 0%, oklch(0.94 0.01 240) 100%)",
        }}
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 10%, oklch(0.82 0.16 220 / 0.18), transparent 55%), radial-gradient(circle at 85% 90%, oklch(0.65 0.22 295 / 0.16), transparent 55%)",
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 max-w-2xl">
          <p
            className="text-xs font-semibold uppercase tracking-[0.28em]"
            style={{ color: "oklch(0.45 0.15 265)" }}
          >
            Clientes que confían
          </p>
          <h2
            className="mt-3 font-display text-3xl font-bold sm:text-4xl"
            style={{ color: "oklch(0.18 0.04 264)" }}
          >
            Alianzas que{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, oklch(0.55 0.18 220), oklch(0.55 0.22 295))",
              }}
            >
              generan impacto
            </span>
          </h2>
          <p className="mt-4 text-base" style={{ color: "oklch(0.35 0.02 265)" }}>
            Organizaciones que entienden que la inteligencia aplicada es la próxima ventaja
            competitiva.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {cases.map((caseStudy) => {
            const logo = logos[caseStudy.id];
            return (
              <article
                key={caseStudy.id}
                className="group relative overflow-hidden rounded-3xl border bg-white p-8 transition-all duration-300 hover:-translate-y-1"
                style={{
                  borderColor: "oklch(0.9 0.01 265)",
                  boxShadow:
                    "0 1px 2px oklch(0.2 0.04 265 / 0.06), 0 20px 40px -24px oklch(0.2 0.04 265 / 0.18)",
                }}
              >
                <header
                  className="flex items-start justify-between gap-4 border-b pb-6"
                  style={{ borderColor: "oklch(0.93 0.01 265)" }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white p-2"
                      style={{
                        border: "1px solid oklch(0.92 0.01 265)",
                        boxShadow:
                          "inset 0 0 0 1px oklch(1 0 0 / 1), 0 8px 20px -12px oklch(0.2 0.04 265 / 0.2)",
                      }}
                    >
                      {logo ? (
                        <img
                          src={logo.src}
                          alt={logo.alt}
                          loading="lazy"
                          className="h-full w-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.nextElementSibling?.classList.remove("hidden");
                          }}
                        />
                      ) : null}
                      <Building2
                        className={`h-8 w-8 ${logo ? "hidden" : ""}`}
                        style={{ color: "oklch(0.4 0.1 265)" }}
                      />
                    </div>
                    <div>
                      <p
                        className="text-[11px] font-semibold uppercase tracking-widest"
                        style={{ color: "oklch(0.5 0.15 265)" }}
                      >
                        {caseStudy.industry}
                      </p>
                      <h3
                        className="mt-1 font-display text-2xl font-bold leading-tight"
                        style={{ color: "oklch(0.18 0.04 264)" }}
                      >
                        {caseStudy.client}
                      </h3>
                      <div
                        className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs"
                        style={{ color: "oklch(0.4 0.02 265)" }}
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" />
                          {caseStudy.country}
                        </span>
                        {logo?.website && (
                          <span className="inline-flex items-center gap-1.5">
                            <Globe className="h-3.5 w-3.5" />
                            {logo.website}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span
                    className="hidden h-9 w-9 items-center justify-center rounded-full transition-transform group-hover:rotate-45 sm:inline-flex"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.82 0.16 220), oklch(0.65 0.22 295))",
                      color: "white",
                    }}
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </header>

                <div className="mt-6 space-y-4">
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "oklch(0.32 0.02 265)" }}
                  >
                    {caseStudy.solution}
                  </p>

                  <ul className="space-y-2">
                    {caseStudy.impact.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2.5 text-sm"
                        style={{ color: "oklch(0.28 0.02 265)" }}
                      >
                        <span
                          className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{
                            background:
                              "linear-gradient(135deg, oklch(0.55 0.18 220), oklch(0.55 0.22 295))",
                          }}
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
