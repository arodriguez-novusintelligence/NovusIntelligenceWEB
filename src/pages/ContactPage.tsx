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

export function ContactPage() {
  const [searchParams] = useSearchParams();
  const interestParam = searchParams.get("interest") ?? "";

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
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
    };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Completa nombre, email y mensaje.");
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

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <h2 className="font-display text-xl font-bold">Datos de contacto</h2>
              <ul className="mt-6 space-y-4 text-sm text-muted-foreground">
                <li className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <a href={`mailto:${site.email}`} className="hover:text-foreground">
                    {site.email}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <a href={site.phoneHref} className="hover:text-foreground">
                    {site.phone}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  {site.city}
                </li>
              </ul>
              <p className="mt-8 text-xs text-muted-foreground">
                Al enviar este formulario aceptas nuestra{" "}
                <Link to="/privacy" className="text-primary hover:underline">
                  política de privacidad
                </Link>{" "}
                y el{" "}
                <Link to="/data-treatment" className="text-primary hover:underline">
                  tratamiento de datos
                </Link>
                .
              </p>
            </div>

            <div className="lg:col-span-3">
              {done ? (
                <div className="rounded-3xl border border-primary/30 bg-gradient-card p-8 text-center">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
                  <h2 className="mt-4 font-display text-2xl font-bold">Mensaje enviado</h2>
                  <p className="mt-2 text-muted-foreground">
                    Gracias por contactarnos. Te responderemos pronto.
                  </p>
                  <Button className="mt-6" onClick={() => setDone(false)}>
                    Enviar otro mensaje
                  </Button>
                </div>
              ) : (
                <form
                  onSubmit={onSubmit}
                  className="rounded-3xl border border-border/60 bg-gradient-card p-6 sm:p-8"
                >
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="name">Nombre *</Label>
                      <Input
                        id="name"
                        name="name"
                        required
                        value={form.name}
                        onChange={update("name")}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="company">Empresa</Label>
                      <Input
                        id="company"
                        name="company"
                        value={form.company}
                        onChange={update("company")}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={update("email")}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={update("phone")}
                        className="mt-2"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="solutionInterest">Solución de interés</Label>
                      <Select
                        id="solutionInterest"
                        name="solutionInterest"
                        value={form.solutionInterest}
                        onChange={update("solutionInterest")}
                        className="mt-2"
                      >
                        <option value="">Seleccionar…</option>
                        {solutions.map((s) => (
                          <option key={s.slug} value={s.slug}>
                            {s.name}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="message">Mensaje *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        rows={5}
                        value={form.message}
                        onChange={update("message")}
                        className="mt-2"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="mt-6 w-full sm:w-auto" disabled={submitting}>
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
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
