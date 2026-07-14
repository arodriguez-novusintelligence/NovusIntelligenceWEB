import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { nav, site } from "@/content/site";
import { NovusLogo } from "@/components/marketing/NovusLogo";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
          <NovusLogo size="sm" />
          <span className="font-display text-lg font-bold">{site.shortName}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
          {nav.main.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:block">
          <Link to="/contact">
            <Button size="sm">Agenda una demo</Button>
          </Link>
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-foreground md:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <nav
          className="border-t border-border/60 bg-background/95 px-4 py-4 md:hidden"
          aria-label="Menú móvil"
        >
          <ul className="flex flex-col gap-2">
            {nav.main.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === "/"}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "block rounded-xl px-4 py-3 text-sm font-medium",
                      isActive ? "bg-primary/10 text-primary" : "text-muted-foreground",
                    )
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
            <li className="pt-2">
              <Link to="/contact" onClick={() => setMobileOpen(false)}>
                <Button className="w-full">Agenda una demo</Button>
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
