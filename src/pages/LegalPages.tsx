import { PageMetaTags } from "@/components/seo/PageMetaTags";
import { site } from "@/content/site";

function LegalLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <PageMetaTags title={`${title} — Novus Intelligence Solutions`} description={title} />
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl font-bold">{title}</h1>
          <div className="prose prose-invert mt-8 max-w-none space-y-4 text-sm leading-relaxed text-muted-foreground">
            {children}
          </div>
        </div>
      </section>
    </>
  );
}

export function PrivacyPage() {
  return (
    <LegalLayout title="Política de privacidad">
      <p>
        {site.name} (&quot;Novus&quot;, &quot;nosotros&quot;) respeta la privacidad de los visitantes
        y clientes de {site.url}. Esta política describe cómo recopilamos, usamos y protegemos
        información personal.
      </p>
      <h2 className="font-display text-lg font-bold text-foreground">Datos que recopilamos</h2>
      <p>
        A través del formulario de contacto recopilamos nombre, email, empresa, teléfono, mensaje y
        solución de interés. También registramos datos técnicos básicos de navegación (logs de
        servidor, dirección IP anonimizada) con fines de seguridad.
      </p>
      <h2 className="font-display text-lg font-bold text-foreground">Uso de la información</h2>
      <p>
        Utilizamos los datos para responder consultas comerciales, preparar propuestas y mejorar
        nuestros servicios. No vendemos ni cedemos datos personales a terceros con fines comerciales.
      </p>
      <h2 className="font-display text-lg font-bold text-foreground">Conservación y seguridad</h2>
      <p>
        Conservamos los datos el tiempo necesario para la relación comercial y obligaciones legales.
        Aplicamos medidas técnicas y organizativas acordes con estándares de la industria.
      </p>
      <h2 className="font-display text-lg font-bold text-foreground">Contacto</h2>
      <p>
        Para ejercer derechos sobre tus datos, escribe a{" "}
        <a href={`mailto:${site.email}`} className="text-primary hover:underline">
          {site.email}
        </a>
        .
      </p>
    </LegalLayout>
  );
}

export function DataTreatmentPage() {
  return (
    <LegalLayout title="Tratamiento de datos personales">
      <p>
        De conformidad con la Ley 1581 de 2012 y el Decreto 1377 de 2013 (Colombia), {site.name}{" "}
        informa sobre el tratamiento de datos personales.
      </p>
      <h2 className="font-display text-lg font-bold text-foreground">Responsable del tratamiento</h2>
      <p>
        {site.name} — {site.city}. Contacto: {site.email}.
      </p>
      <h2 className="font-display text-lg font-bold text-foreground">Finalidades</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>Gestión de solicitudes comerciales y de contacto</li>
        <li>Envío de información sobre servicios y soluciones</li>
        <li>Cumplimiento de obligaciones legales y contractuales</li>
      </ul>
      <h2 className="font-display text-lg font-bold text-foreground">Derechos del titular</h2>
      <p>
        Puedes conocer, actualizar, rectificar y suprimir tus datos, así como revocar la
        autorización, mediante solicitud a {site.email}.
      </p>
    </LegalLayout>
  );
}

export function TermsPage() {
  return (
    <LegalLayout title="Términos y condiciones">
      <p>
        El acceso y uso del sitio web de {site.name} implica la aceptación de estos términos. Si no
        estás de acuerdo, abstente de utilizar el sitio.
      </p>
      <h2 className="font-display text-lg font-bold text-foreground">Uso del sitio</h2>
      <p>
        El contenido es informativo sobre servicios de inteligencia artificial. No constituye
        asesoría legal, financiera ni garantía de resultados específicos.
      </p>
      <h2 className="font-display text-lg font-bold text-foreground">Propiedad intelectual</h2>
      <p>
        Marcas, textos, diseños y software del sitio son propiedad de {site.name} o sus licenciantes.
        Queda prohibida la reproducción no autorizada.
      </p>
      <h2 className="font-display text-lg font-bold text-foreground">Limitación de responsabilidad</h2>
      <p>
        Novus no se hace responsable por daños indirectos derivados del uso del sitio o
        interrupciones del servicio, dentro de los límites permitidos por la ley aplicable.
      </p>
      <h2 className="font-display text-lg font-bold text-foreground">Legislación aplicable</h2>
      <p>
        Estos términos se rigen por las leyes de la República de Colombia. Jurisdicción: {site.city}.
      </p>
    </LegalLayout>
  );
}
