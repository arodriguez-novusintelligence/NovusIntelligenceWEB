import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Linkedin, Instagram, Facebook } from "lucide-react";
import { nav, site } from "@/content/site";
import { NovusLogo } from "@/components/marketing/NovusLogo";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-navy-surface/60">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <NovusLogo size="sm" />
              <span className="font-display text-lg font-bold">{site.shortName}</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{site.taglineEs}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">Contacto</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <a href={`mailto:${site.email}`} className="hover:text-foreground">
                  {site.email}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <a href={site.phoneHref} className="hover:text-foreground">
                  {site.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                <span>{site.city}</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">Navegación</h3>
            <ul className="mt-4 space-y-2">
              {nav.main.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="text-sm text-muted-foreground hover:text-foreground">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">Legal</h3>
            <ul className="mt-4 space-y-2">
              {nav.legal.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="text-sm text-muted-foreground hover:text-foreground">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex gap-4">
              <a
                href={site.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-muted-foreground hover:text-primary"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href={site.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-muted-foreground hover:text-primary"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={site.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-muted-foreground hover:text-primary"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-border/60 pt-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {site.name}. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
