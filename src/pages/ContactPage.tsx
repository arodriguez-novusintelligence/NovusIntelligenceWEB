import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { PageMetaTags } from "@/components/seo/PageMetaTags";
import { site } from "@/content/site";
import { solutions } from "@/content/solutions";
import { submitContact } from "@/services/contact";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";

interface ContactFormState {
  name: string;
  company: string;
  email: string;
  phone: string;
  message: string;
  solutionInterest: string;
}

interface FieldErrors {
  name?: string;
  email?: string;
  message?: string;
}

export function ContactPage() {
  const [searchParams] = useSearchParams();
  const interestParam = searchParams.get("interest") ?? "";

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [form, setForm] = useState<ContactFormState>({
    name: "",
    company: "",
    email: "",
    phone: "",
    message: "",
    solutionInterest: interestParam,
  });

  const update =
    (key: keyof ContactFormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      if (errors[key as keyof FieldErrors]) {
        setErrors((prev) => ({ ...prev, [key]: undefined }));
      }
    };

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (!form.name.trim()) next.name = "El nombre es obligatorio.";
    if (!form.email.trim()) next.email = "El email es obligatorio.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = "Ingresa un email válido.";
    }
    if (!form.message.trim()) next.message = "El mensaje es obligatorio.";
    return next;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      toast.error("Revisa los campos marcados.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitContact({
        name: form.name.trim(),
        company: form.company.trim() || undefined,
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        message: form.message.trim(),
        solutionInterest: form.solutionInterest || undefined,
      });

      if (res.ok) {
        toast.success(res.message ?? "Gracias, te contactaremos muy pronto.");
        setDone(true);
        setErrors({});
        setForm({
          name: "",
          company: "",
          email: "",
          phone: "",
          message: "",
          solutionInterest: "",
        });
      } else {
        toast.error(res.message ?? "No pudimos enviar tu mensaje.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageMetaTags
        title="Contacto — Novus Intelligence Solutions"
        description="Hablemos sobre tu próximo proyecto de IA, automatización o integración cloud."
      />

      <section className="relative overflow-hidden bg-gradient-hero py-20">
        <div className="absolute inset-0 grid-bg opacity-30" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Contacto</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold sm:text-5xl">
            Hablemos sobre tu <span className="text-gradient-brand">próximo proyecto</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            Cuéntanos tu reto. Respondemos en menos de 24 horas hábiles.
          </p>
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-section py-20">
        <div className="absolute inset-0 grid-bg opacity-20" aria-hidden />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.4fr] lg:px-8">
          <div className="space-y-6">
            <div className="rounded-2xl border border-border/60 bg-navy-elevated p-6 shadow-elevated">
              <h2 className="font-display text-xl font-bold text-foreground">Datos de contacto</h2>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 text-primary" />
                  <a href={`mailto:${site.email}`} className="break-all hover:text-foreground">
                    {site.email}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-4 w-4 text-primary" />
                  <a href={site.phoneHref} className="hover:text-foreground">
                    {site.phone}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                  <span className="text-foreground">{site.city}</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-border/60 bg-navy-elevated p-6 shadow-elevated">
              <h3 className="font-display font-semibold text-foreground">Horario</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Lunes a viernes · 8:00 — 18:00 (COT)
              </p>
            </div>

            <div className="rounded-2xl border border-primary/20 bg-primary/10 p-6">
              <h3 className="font-display font-semibold text-primary">Partner principal</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Soluciones nativas sobre AWS, con soporte adicional para Azure y Google Cloud.
              </p>
            </div>
          </div>

          <form
            onSubmit={onSubmit}
            className="rounded-2xl border border-border/60 bg-navy-elevated p-8 shadow-elevated"
          >
            {done ? (
              <div className="flex flex-col items-center py-12 text-center">
                <CheckCircle2 className="h-14 w-14 text-primary" />
                <h2 className="mt-4 font-display text-2xl font-bold text-foreground">¡Gracias!</h2>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  Tu mensaje fue recibido. Andrés y el equipo te responderán muy pronto.
                </p>
                <Button className="mt-6 shadow-glow hover:opacity-95" onClick={() => setDone(false)}>
                  Enviar otro
                </Button>
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-foreground">
                      Nombre *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      required
                      value={form.name}
                      onChange={update("name")}
                      autoComplete="name"
                      aria-invalid={!!errors.name}
                      className="bg-navy-surface/50"
                    />
                    {errors.name && (
                      <p className="text-xs text-red-400" role="alert">
                        {errors.name}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-foreground">
                      Empresa
                    </Label>
                    <Input
                      id="company"
                      name="company"
                      value={form.company}
                      onChange={update("company")}
                      autoComplete="organization"
                      className="bg-navy-surface/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">
                      Email *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={update("email")}
                      autoComplete="email"
                      aria-invalid={!!errors.email}
                      className="bg-navy-surface/50"
                    />
                    {errors.email && (
                      <p className="text-xs text-red-400" role="alert">
                        {errors.email}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-foreground">
                      Teléfono
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={update("phone")}
                      autoComplete="tel"
                      className="bg-navy-surface/50"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="solutionInterest" className="text-foreground">
                      Solución de interés
                    </Label>
                    <Select
                      id="solutionInterest"
                      name="solutionInterest"
                      value={form.solutionInterest}
                      onChange={update("solutionInterest")}
                      className="bg-navy-surface/50"
                    >
                      <option value="">Selecciona una solución (opcional)</option>
                      {solutions.map((s) => (
                        <option key={s.slug} value={s.slug}>
                          {s.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="message" className="text-foreground">
                      Mensaje *
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={update("message")}
                      placeholder="Cuéntanos brevemente tu reto y objetivos."
                      aria-invalid={!!errors.message}
                      className="bg-navy-surface/50"
                    />
                    {errors.message && (
                      <p className="text-xs text-red-400" role="alert">
                        {errors.message}
                      </p>
                    )}
                  </div>
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  Al enviar aceptas nuestra{" "}
                  <Link to="/privacy" className="underline hover:text-foreground">
                    política de privacidad
                  </Link>{" "}
                  y el{" "}
                  <Link to="/data-treatment" className="underline hover:text-foreground">
                    tratamiento de datos
                  </Link>
                  .
                </p>
                <Button
                  type="submit"
                  className="mt-6 w-full shadow-glow hover:opacity-95"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enviando…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Enviar mensaje
                    </>
                  )}
                </Button>
              </>
            )}
          </form>
        </div>
      </section>
    </>
  );
}
