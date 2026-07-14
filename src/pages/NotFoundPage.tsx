import { Link } from "react-router-dom";
import { PageMetaTags } from "@/components/seo/PageMetaTags";
import { Button } from "@/components/ui/Button";

export function NotFoundPage() {
  return (
    <>
      <PageMetaTags
        title="Página no encontrada — Novus Intelligence Solutions"
        description="La página solicitada no existe."
      />
      <section className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-32 text-center">
        <p className="text-6xl font-bold text-primary">404</p>
        <h1 className="mt-4 font-display text-3xl font-bold">Página no encontrada</h1>
        <p className="mt-4 max-w-md text-muted-foreground">
          La ruta que buscas no existe o fue movida.
        </p>
        <Link to="/" className="mt-8">
          <Button>Volver al inicio</Button>
        </Link>
      </section>
    </>
  );
}
