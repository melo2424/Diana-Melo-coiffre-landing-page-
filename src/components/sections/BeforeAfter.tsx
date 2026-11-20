"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { pairs } from "@/data/before-after";
import { tones } from "@/data/images";
import { bookingLink } from "@/data/site";
import { Compare } from "@/components/ui/Compare";
import { Picture } from "@/components/ui/Picture";
import { Cta } from "@/components/ui/Cta";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Reveal } from "@/components/motion/Reveal";

/** Antes y después con la línea dorada. Sin parejas cargadas, la sección no se muestra. */
export function BeforeAfter() {
  const [i, setI] = useState(0);
  if (!pairs.length) return null;
  const p = pairs[i];

  return (
    <section id="antes-despues" aria-labelledby="antes-despues-titulo" className="px-gutter pt-section">
      <div className="grid gap-y-10 lg:grid-cols-12 lg:gap-x-10">
        <div className="lg:col-span-4">
          <SplitReveal id="antes-despues-titulo" lines={["Antes y", "después"]} className="text-title text-text" />
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <p className="mt-8 flex items-center gap-3 font-display text-statement text-gold-light">
                <span aria-hidden className="swatch size-6" style={{ background: tones[p.tone] }} />
                {p.tone}
              </p>
              <p className="mt-3 text-body text-text">{p.title}</p>
              {p.note ? <p className="mt-2 text-small text-muted">{p.note}</p> : null}
            </motion.div>
          </AnimatePresence>
          <Cta href={bookingLink(`Hola Diana, vi tu antes y después en tono ${p.tone} y quiero un cambio así.`)} className="mt-8">
            Quiero un cambio así
          </Cta>

          {pairs.length > 1 ? (
            <ul className="mt-10 flex flex-wrap gap-2.5" aria-label="Otros cambios">
              {pairs.map((x, n) => (
                <li key={x.id}>
                  <button
                    type="button"
                    aria-pressed={n === i}
                    aria-label={x.title}
                    onClick={() => setI(n)}
                    className={`block size-16 overflow-hidden rounded-full ring-offset-4 ring-offset-ink transition-shadow ${n === i ? "ring-2 ring-gold" : "ring-1 ring-graphite hover:ring-gold/60"}`}
                  >
                    <Picture image={x.after} sizes="64px" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <Reveal order={1} className="min-w-0 lg:col-span-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={p.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <Compare
                ratio={`${p.after.width} / ${p.after.height}`}
                before={<Picture image={p.before} sizes="(min-width: 1024px) 60vw, 92vw" />}
                after={<Picture image={p.after} sizes="(min-width: 1024px) 60vw, 92vw" />}
                className="mx-auto max-h-[80svh]"
              />
            </motion.div>
          </AnimatePresence>
        </Reveal>
      </div>
    </section>
  );
}
