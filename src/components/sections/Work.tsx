"use client";

import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { families, portfolio, tones, type Family, type SiteImage } from "@/data/images";
import { ColorLab } from "./ColorLab";
import { Lightbox, familyLabel } from "./Lightbox";
import { bookingLink } from "@/data/site";
import { Picture } from "@/components/ui/Picture";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Reveal } from "@/components/motion/Reveal";

type Filter = "todos" | Family;

/**
 * Patrón del muro (6 piezas, se repite). Columnas de una retícula de 4 en escritorio y de 2 en móvil.
 * Las piezas grandes se reservan para las fotos de alta resolución; quedan celdas vacías a propósito.
 */
const slots: { desk: string; phone: string; ratio: string; big?: boolean; offset?: boolean }[] = [
  { desk: "1 / span 2", phone: "1 / span 2", ratio: "1 / 1", big: true },
  { desk: "4 / span 1", phone: "2 / span 1", ratio: "3 / 4", offset: true },
  { desk: "2 / span 1", phone: "1 / span 1", ratio: "4 / 5" },
  { desk: "3 / span 1", phone: "2 / span 1", ratio: "3 / 4", offset: true },
  { desk: "1 / span 1", phone: "1 / span 1", ratio: "3 / 4" },
  { desk: "3 / span 2", phone: "1 / span 2", ratio: "1 / 1", big: true },
];

const INITIAL = { desk: 12, phone: 6 };
const ease = [0.22, 1, 0.36, 1] as const;
const wishByFamily: Record<Family, string> = {
  rubios: "Quiero un rubio",
  balayage: "Quiero un balayage",
  cobrizos: "Quiero un cobrizo",
  rizos: "Quiero color en mis rizos",
  cortes: "Quiero un corte así",
};

/** Coloca cada foto en un hueco: las grandes primero a las fotos nítidas. */
function arrange(list: SiteImage[]) {
  const sharp = list.filter((i) => i.width >= 900);
  const soft = list.filter((i) => i.width < 900);
  return list.map((_, n) => {
    const slot = slots[n % slots.length];
    const pick = slot.big ? (sharp.shift() ?? soft.shift()) : (soft.shift() ?? sharp.shift());
    return { image: pick!, slot };
  });
}

export function Work() {
  const reduce = useReducedMotion();
  const [family, setFamily] = useState<Filter>("todos");
  const [expanded, setExpanded] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);
  const [desk, setDesk] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const set = () => setDesk(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);

  const inFamily = useMemo(
    () => (family === "todos" ? portfolio : portfolio.filter((i) => i.category === family)),
    [family],
  );
  const filtered = inFamily;
  const placed = useMemo(() => arrange(filtered), [filtered]);
  const visible = family === "todos" && !expanded ? placed.slice(0, desk ? INITIAL.desk : INITIAL.phone) : placed;
  const hidden = placed.length - visible.length;

  const chooseFamily = (f: Filter) => setFamily(f);

  const wish =
    family !== "todos"
      ? {
          label: wishByFamily[family],
          msg: `Hola Diana, vi tus trabajos de ${familyLabel(family).toLowerCase()} y quiero agendar una cita.`,
        }
      : { label: "Agendar mi cita", msg: "Hola Diana, vi tus trabajos y quiero agendar una cita." };

  const close = useCallback(() => {
    setOpen(null);
    requestAnimationFrame(() => lastTrigger.current?.focus());
  }, []);

  return (
    <section id="trabajos" aria-labelledby="trabajos-titulo" className="px-gutter pt-section">
      <div className="grid gap-y-8 md:grid-cols-12 md:gap-x-5">
        <SplitReveal
          id="trabajos-titulo"
          lines={["Trabajos"]}
          className="text-title text-text md:col-span-6"
        />
        <Reveal order={1} className="md:col-span-5 md:col-start-8 md:self-end">
          <p className="max-w-[40ch] text-body text-text">
            {portfolio.length} colores reales que salieron del estudio, cada uno con el nombre de su tono, como Diana
            los anota en su carta.
          </p>
        </Reveal>
      </div>

      {/* Laboratorio de color: el círculo de tonos */}
      <ColorLab />

      {/* Todo el portafolio, por familia */}
      <Reveal order={2} className="mt-section">
        <h3 className="mb-8 font-display text-statement text-text">Todo el portafolio, por familia</h3>
        <div role="group" aria-label="Familias de color" className="flex flex-wrap gap-x-7 gap-y-2">
          {(["todos", ...families.map((f) => f.id)] as Filter[]).map((f) => {
            const active = family === f;
            const count = f === "todos" ? portfolio.length : portfolio.filter((i) => i.category === f).length;
            return (
              <button
                key={f}
                type="button"
                aria-pressed={active}
                onClick={() => chooseFamily(f)}
                className={`relative h-12 font-display text-[1.75rem] leading-none transition-colors duration-[var(--dur-fast)] md:text-[2.25rem] ${
                  active ? "text-gold-light" : "text-muted hover:text-text"
                }`}
              >
                {f === "todos" ? "Todos" : familyLabel(f)}
                <span className="ml-1 align-top text-[0.875rem]">{count}</span>
                {active ? (
                  <motion.span
                    layoutId="family-mark"
                    aria-hidden
                    className="absolute inset-x-0 -bottom-0.5 h-[2px] bg-gold"
                    transition={{ duration: reduce ? 0 : 0.45, ease }}
                  />
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <p className="max-w-[46ch] text-body text-muted">
            {family === "todos" ? "Todos los trabajos, del más reciente al primero." : families.find((f) => f.id === family)?.lede}
          </p>
          <a
            href={bookingLink(wish.msg)}
            target="_blank"
            rel="noopener"
            className="group inline-flex h-12 shrink-0 items-center gap-3 self-start bg-accent px-6 text-body font-medium text-on-accent transition-colors duration-[var(--dur-fast)] hover:bg-gold-light active:translate-y-px md:self-auto"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={wish.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: reduce ? 0 : 0.25, ease }}
              >
                {wish.label}
              </motion.span>
            </AnimatePresence>
            <span aria-hidden className="transition-transform duration-[var(--dur-base)] group-hover:translate-x-1">
              →
            </span>
          </a>
        </div>
        <p aria-live="polite" className="sr-only">
          {filtered.length} trabajos{family !== "todos" ? ` de ${familyLabel(family)}` : ""}
        </p>
      </Reveal>

      {/* El muro */}
      <LayoutGroup>
        <ul className="mt-12 grid grid-cols-2 gap-x-2.5 gap-y-10 md:mt-16 md:grid-cols-4 md:gap-x-4 md:gap-y-16">
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map(({ image, slot }, n) => (
              <motion.li
                layout={!reduce}
                key={image.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.25 } }}
                transition={{ duration: reduce ? 0.2 : 0.9, delay: (n % 3) * 0.08, ease }}
                className={`[grid-column:var(--m)] md:[grid-column:var(--d)] ${slot.offset ? "md:mt-[14vh]" : ""}`}
                style={{ "--m": slot.phone, "--d": slot.desk } as CSSProperties}
              >
                <button
                  type="button"
                  className="tile group block w-full text-left"
                  onClick={(e) => {
                    lastTrigger.current = e.currentTarget;
                    setOpen(placed.findIndex((p) => p.image.id === image.id));
                  }}
                  aria-label={`Ver en grande: ${image.alt}`}
                >
                  <motion.div layoutId={`photo-${image.id}`} className="overflow-hidden bg-onyx">
                    <Picture
                      image={image}
                      ratio={slot.ratio}
                      sizes={slot.big ? "(min-width: 768px) 46vw, 92vw" : "(min-width: 768px) 22vw, 46vw"}
                      objectPosition="50% 30%"
                      className="tile-img"
                    />
                  </motion.div>
                  <span className="mt-3 flex items-baseline justify-between gap-3 text-small">
                    <span className="inline-flex items-center gap-2 text-text">
                      <span aria-hidden className="inline-block size-3" style={{ background: tones[image.tone ?? ""] }} />
                      {image.tone}
                    </span>
                    <span className="text-muted">{familyLabel(image.category)}</span>
                  </span>
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>

        {hidden > 0 ? (
          <div className="mt-14 flex justify-center">
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="h-12 text-body text-text underline decoration-gold/70 decoration-2 underline-offset-[7px] transition-colors hover:text-gold-light hover:decoration-gold"
            >
              Ver los {hidden} trabajos restantes
            </button>
          </div>
        ) : null}

        <AnimatePresence>
          {open !== null ? (
            <Lightbox
              key="lightbox"
              items={placed.map((p) => p.image)}
              index={open}
              onIndex={setOpen}
              onClose={close}
            />
          ) : null}
        </AnimatePresence>
      </LayoutGroup>
    </section>
  );
}
