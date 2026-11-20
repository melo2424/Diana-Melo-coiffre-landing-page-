"use client";

import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { nav, site } from "@/data/site";
import { LogoInline } from "@/components/brand/Logo";
import { Cta } from "@/components/ui/Cta";
import Link from "next/link";

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Barra plana: logotipo, cinco enlaces, una acción. Fondo sólido (sin vidrio).
 * Se esconde al bajar y vuelve al subir. En móvil, un panel a pantalla completa.
 */
export function Header() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  // Arriba del todo el hero ya muestra el logotipo grande: aquí solo el monograma.
  const [past, setPast] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > 240 && y > prev && !open);
    setPast(y > window.innerHeight * 0.55);
  });

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
    <motion.header
      className="fixed inset-x-0 top-0 z-50 bg-ink"
      animate={{ y: hidden ? "-100%" : "0%" }}
      transition={{ duration: reduce ? 0 : 0.45, ease }}
      onFocusCapture={() => setHidden(false)}
    >
      <div className="flex h-header items-center justify-between gap-6 px-gutter">
        <Link
          href="/#inicio"
          className="text-pearl transition-colors duration-[var(--dur-fast)] hover:text-gold-light"
          aria-label={`${site.name}, inicio`}
        >
          <LogoInline showWord={past || open} className="h-9 w-auto md:h-10" />
        </Link>

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="relative py-2 text-[0.9375rem] text-text transition-colors duration-[var(--dur-fast)] after:absolute after:inset-x-0 after:-bottom-0.5 after:h-[2px] after:origin-left after:scale-x-0 after:bg-gold after:transition-transform after:duration-[var(--dur-base)] hover:text-gold-light hover:after:scale-x-100"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <Cta href="/#agendar" size="sm" icon={null}>
            Agendar<span className="hidden sm:inline">&nbsp;cita</span>
          </Cta>
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

      <AnimatePresence>
        {open ? (
          <motion.div
            id="menu-movil"
            ref={panelRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-0 bottom-0 top-header bg-onyx px-gutter pb-8 pt-10 lg:hidden"
          >
            <nav aria-label="Principal móvil" className="flex h-full flex-col justify-between">
              <ul className="flex flex-col gap-1">
                {nav.map((item, i) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, y: reduce ? 0 : 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.05 + i * 0.06, ease }}
                  >
                    <a
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="block py-2 font-display text-[2.75rem] leading-[1.1] text-text active:text-gold"
                    >
                      {item.label}
                    </a>
                  </motion.li>
                ))}
              </ul>
              <Cta href="/#agendar" size="lg" className="w-full justify-between" onClick={() => setOpen(false)}>
                Agendar cita
              </Cta>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}
