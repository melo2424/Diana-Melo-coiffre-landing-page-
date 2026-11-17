"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { byId } from "@/data/images";
import { bookingLink } from "@/data/site";
import { Picture } from "@/components/ui/Picture";
import { Reveal } from "@/components/motion/Reveal";

const frames = [
  { id: "olaplex/2026-09-21-ddjgpkgjqmi-1", name: "N.º4P y N.º5P", fact: "Matiz para rubios", lifted: true },
  { id: "olaplex/2026-08-01-dbgeyfeu0k6-reel-cover", name: "N.º4 y N.º5", fact: "Champú y acondicionador" },
  { id: "olaplex/2026-10-23-de1skrfnya", name: "Tratamientos", fact: "Reparación en casa" },
  { id: "olaplex/2026-09-16-ddvnk9ehndc-reel-cover", name: "La rutina", fact: "Lo que te llevas" },
].map((f) => ({ ...f, image: byId(f.id) }));

const ease = [0.22, 1, 0.36, 1] as const;

export function Olaplex() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["3%", "-3%"]);
  // En móvil la fila se desliza con el dedo; el arrastre ligado al scroll solo va en escritorio.
  const [desk, setDesk] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const set = () => setDesk(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);
  const lifted = frames[0];
  const run = frames.slice(1);

  return (
    <section ref={ref} id="olaplex" aria-labelledby="olaplex-titulo" className="overflow-x-clip pt-section">
      <div className="px-gutter lg:grid lg:grid-cols-12 lg:gap-x-5">
        <div className="lg:col-span-3 lg:flex lg:flex-col lg:justify-between">
          <Reveal>
            <h2 id="olaplex-titulo" className="text-title text-text">
              Olaplex
            </h2>
            <p className="mt-6 max-w-[30ch] text-body text-text">
              Lo que protege tu cabello en el estudio, y lo que te llevas para cuidarlo en casa. Solo vitrina: Diana te
              dice cuál va con tu tono.
            </p>
            <a
              href={bookingLink("Hola Diana, ¿qué productos Olaplex me recomiendas para mi tono?")}
              target="_blank"
              rel="noopener"
              className="mt-6 inline-flex h-11 items-center text-body text-text underline decoration-gold/70 decoration-2 underline-offset-[7px] transition-colors hover:text-gold-light hover:decoration-gold"
            >
              Pregúntale por tu rutina
            </a>
          </Reveal>
          <Reveal order={2} className="mt-10 hidden lg:block">
            <p className="max-w-[28ch] text-[0.9375rem] text-muted">
              N.º4P y N.º5P llevan pigmento violeta: neutralizan el amarillo de los rubios entre una visita y otra.
            </p>
          </Reveal>
        </div>

        {/* La fila: una pieza levantada, las demás a una sola altura */}
        <motion.ul
          style={desk ? { x } : undefined}
          className="mt-12 grid grid-cols-3 gap-x-1.5 gap-y-8 lg:col-span-9 lg:mt-0 lg:flex lg:items-end lg:gap-1.5"
        >
          {[lifted, ...run].map((f, i) => (
            <motion.li
              key={f.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: reduce ? 0.2 : 1, delay: i * 0.09, ease }}
              className={`group min-w-0 ${f.lifted ? "col-span-3 lg:w-[40%] lg:shrink-0" : "lg:flex-1"}`}
            >
              <div
                className="w-full overflow-hidden bg-onyx"
                style={{ aspectRatio: `${f.image.width} / ${f.image.height}` }}
              >
                <Picture
                  image={f.image}
                  sizes={f.lifted ? "(min-width: 768px) 36vw, 78vw" : "(min-width: 768px) 18vw, 40vw"}
                  className="transition-transform duration-[1100ms] ease-[var(--ease-out)] group-hover:scale-[1.04]"
                />
              </div>
              <p className="mt-3 flex flex-col text-[0.9375rem]">
                <span className="text-text">{f.name}</span>
                <span className="text-muted">{f.fact}</span>
              </p>
            </motion.li>
          ))}
        </motion.ul>
        <p className="mt-10 max-w-[36ch] text-[0.9375rem] text-muted lg:hidden">
          N.º4P y N.º5P llevan pigmento violeta: neutralizan el amarillo de los rubios entre una visita y otra.
        </p>
      </div>
    </section>
  );
}
