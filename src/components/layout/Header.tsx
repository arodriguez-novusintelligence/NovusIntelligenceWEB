import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { nav } from "@/content/site";
import { NovusLogo } from "@/components/marketing/NovusLogo";
import { Button } from "@/components/ui/Button";
import { NOVUS_DEMO_EVENT } from "@/components/sections/NovusDevFrameworkDemo";
import { cn } from "@/utils/cn";

function dispatchDemoEvent() {
  window.dispatchEvent(new CustomEvent(NOVUS_DEMO_EVENT));
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  const handleHomeClick = () => {
    if (pathname === "/") dispatchDemoEvent();
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center" aria-label="Inicio Novus" onClick={() => setMobileOpen(false)}>
          <NovusLogo size="sm" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
          {nav.main.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={item.to === "/" ? handleHomeClick : undefined}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )
              }
            >
              {({ isActive }) => (
                <>
                  {item.label}
                  {isActive && (
                    <span className="mx-auto mt-1 block h-0.5 w-6 rounded bg-gradient-brand" />
                  )}
                </>
              )}
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
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border md:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <nav
          className="border-t border-border/60 bg-background/95 md:hidden"
          aria-label="Menú móvil"
        >
          <ul className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4">
            {nav.main.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === "/"}
                  onClick={item.to === "/" ? handleHomeClick : () => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "block rounded-md px-3 py-2 text-sm font-medium",
                      isActive
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
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
