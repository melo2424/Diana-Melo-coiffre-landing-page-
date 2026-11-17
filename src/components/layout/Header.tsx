"use client";

import { useEffect, useRef, useState } from "react";
import { bookingHref, nav, site } from "@/data/site";
import { Button } from "@/components/ui/Button";

/**
 * Barra fija y plana: logotipo, cinco enlaces, una acción.
 * Fondo sólido --ink (sin vidrio ni desenfoque). En móvil, un panel a pantalla completa.
 */
export function Header() {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-ink">
      <div className="flex h-header items-center justify-between gap-6 px-gutter">
        <a
          href="#inicio"
          className="font-display text-[1.1875rem] leading-none whitespace-nowrap sm:text-[1.375rem] tracking-[-0.01em] text-text transition-colors duration-[var(--dur-fast)] hover:text-gold-light md:text-[1.5rem]"
          aria-label={`${site.name}, inicio`}
        >
          Diana Melo <span className="text-gold">Coiffé</span>
        </a>

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-9">
            {nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="relative py-2 text-[0.9375rem] text-text transition-colors duration-[var(--dur-fast)] after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-gold after:transition-transform after:duration-[var(--dur-base)] hover:text-gold-light hover:after:scale-x-100"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <Button href={bookingHref} target="_blank" rel="noopener" className="px-4 sm:px-5">
            <span>
              Agendar<span className="hidden sm:inline"> cita</span>
            </span>
          </Button>
          <button
            ref={toggleRef}
            type="button"
            className="inline-flex h-11 items-center px-1 text-[0.9375rem] text-text lg:hidden"
            aria-expanded={open}
            aria-controls="menu-movil"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Cerrar" : "Menú"}
          </button>
        </div>
      </div>

      <div
        id="menu-movil"
        ref={panelRef}
        hidden={!open}
        className="fixed inset-x-0 bottom-0 top-header bg-onyx px-gutter pb-8 pt-10 lg:hidden"
      >
        <nav aria-label="Principal móvil" className="flex h-full flex-col justify-between">
          <ul className="flex flex-col gap-1">
            {nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block py-2 font-display text-[2.5rem] leading-[1.1] text-text active:text-gold"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <Button href={bookingHref} target="_blank" rel="noopener" size="lg" className="w-full">
            Agendar cita
          </Button>
        </nav>
      </div>
    </header>
  );
}
