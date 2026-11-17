"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { byId } from "@/data/images";
import { bookingLink, site } from "@/data/site";
import { Picture } from "@/components/ui/Picture";
import { Cta } from "@/components/ui/Cta";
import { Reveal } from "@/components/motion/Reveal";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Monogram } from "@/components/brand/Logo";
import { WhatsAppIcon } from "@/components/layout/WhatsAppButton";

const ease = [0.22, 1, 0.36, 1] as const;

/** El álbum: fotos reales de Diana en eventos, sueltas como polaroids sobre la mesa. */
const album = [
  { id: "trabajos/2026-08-29-dcopqbwxmje", caption: "Alfombra roja del Cluster", x: "0%", y: "4%", w: "52%", r: -6 },
  { id: "trabajos/2026-10-04-degg4-rjff7", caption: "Con los diseñadores de la región", x: "46%", y: "0%", w: "50%", r: 5 },
  { id: "trabajos/2026-09-24-ddq5aacrgy", caption: "Noche de evento", x: "6%", y: "47%", w: "46%", r: 3 },
  { id: "trabajos/2026-09-21-ddks5xwjxbb", caption: "Feria de belleza", x: "50%", y: "45%", w: "46%", r: -4 },
] as const;

// POR CONFIRMAR con Diana: el texto está escrito en su voz a partir de lo que muestra su trabajo.
const promises: { title: string; text: string; icon: ReactNode }[] = [
  {
    title: "Primero te escucho",
    text: "La cita empieza con una conversación: qué color tienes hoy, qué te has hecho antes y cómo te lo imaginas.",
    icon: <path d="M4 5.5h16v10H9l-5 4v-14Z" />,
  },
  {
    title: "Cuido tu cabello",
    text: "Protejo la fibra en cada proceso de color. Si un tono no le conviene a tu cabello, te lo digo de frente.",
    icon: <path d="M12 3.5c3.5 4.2 6 7.4 6 10.5a6 6 0 0 1-12 0c0-3.1 2.5-6.3 6-10.5Z" />,
  },
  {
    title: "Te vas sabiendo cuidarlo",
    text: "Te explico qué usar en casa para que el color dure y brille hasta tu próxima visita.",
    icon: <path d="M12 20s-7-4.3-7-9.5A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.5C19 15.7 12 20 12 20Z" />,
  },
];

export function About() {
  return (
    <section id="diana" aria-labelledby="diana-titulo" className="overflow-hidden px-gutter pt-section">
      <div className="grid items-center gap-y-16 lg:grid-cols-12 lg:gap-x-10">
        {/* ---------------- el álbum ---------------- */}
        <div className="order-2 lg:order-1 lg:col-span-6">
          <Album />
          <p className="mt-4 text-center text-small text-muted">Arrastra las fotos.</p>
        </div>

        {/* ---------------- la carta ---------------- */}
        <div className="order-1 lg:order-2 lg:col-span-6">
          <SplitReveal id="diana-titulo" lines={["Hola, soy", "Diana Melo"]} className="text-title text-text" />
          <Reveal order={1}>
            <p className="mt-8 max-w-[30ch] text-statement text-gold-light">
              Colorista y estilista en {site.city.split(",")[0]}. Quiero que salgas sintiéndote tú, con el color que
              soñabas.
            </p>
          </Reveal>
          <Reveal order={2}>
            <div className="mt-8 max-w-[52ch] space-y-4 text-body text-text">
              <p>
                Antes de tocar un solo mechón nos sentamos a conversar. Con lo que me cuentas armo tu mezcla, tono por
                tono, y te voy explicando cada paso para que sepas qué le pasa a tu cabello.
              </p>
              <p>
                Fuera del estudio me encuentras en pasarelas y ferias de belleza de la región, peinando junto a otros
                estilistas y diseñadores. Lo que aprendo allá vuelve a tu silla.
              </p>
            </div>
          </Reveal>
          <Reveal order={3}>
            <div className="mt-8 flex items-center gap-4">
              <Monogram play="inView" tone="gold" coiffure={false} className="h-16 w-auto" />
              <div>
                <p className="font-display text-[1.5rem] leading-none text-text">Con cariño, Diana</p>
                <p className="mt-1 text-small text-muted">{site.instagram.handle}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ---------------- lo que vas a sentir ---------------- */}
      <div className="mt-20 md:mt-28">
        <Reveal>
          <h3 className="font-display text-statement text-text">Así te vas a sentir en mi silla</h3>
        </Reveal>
        <ul className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
          {promises.map((p, i) => (
            <Reveal as="li" key={p.title} order={i + 1} className={i === 1 ? "md:mt-10" : i === 2 ? "md:mt-20" : ""}>
              <PromiseItem {...p} />
            </Reveal>
          ))}
        </ul>
        <Reveal order={4}>
          <div className="mt-14 flex flex-wrap items-center gap-4">
            <Cta href={bookingLink("Hola Diana, quiero conocerte y agendar una cita.")} size="lg" icon={<WhatsAppIcon />}>
              Escríbeme
            </Cta>
            <Cta href={site.instagram.url} variant="ghost" size="lg">
              Sígueme en Instagram
            </Cta>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function PromiseItem({ title, text, icon }: { title: string; text: string; icon: ReactNode }) {
  return (
    <div className="group flex gap-5">
      <span
        aria-hidden
        className="relative grid size-14 shrink-0 place-items-center rounded-full text-gold-light ring-1 ring-gold/45 transition-colors duration-500 group-hover:bg-gold group-hover:text-ink"
      >
        {/* aro que respira */}
        <span className="absolute inset-0 animate-[ring-breathe_3.2s_ease-in-out_infinite] rounded-full ring-1 ring-gold/30" />
        <svg
          viewBox="0 0 24 24"
          className="size-6 transition-transform duration-500 group-hover:scale-110"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.4}
          strokeLinejoin="round"
        >
          {icon}
        </svg>
      </span>
      <div>
        <p className="font-display text-[1.375rem] leading-tight text-text">{title}</p>
        <p className="mt-2 max-w-[36ch] text-body text-muted">{text}</p>
      </div>
    </div>
  );
}

function Album() {
  const reduce = useReducedMotion();
  const table = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={table}
      className="relative mx-auto aspect-[4/5] w-full max-w-[34rem]"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
    >
      {album.map((p, i) => (
        <motion.figure
          key={p.id}
          drag={!reduce}
          dragConstraints={table}
          dragElastic={0.15}
          dragTransition={{ bounceStiffness: 260, bounceDamping: 22 }}
          whileHover={reduce ? undefined : { rotate: 0, scale: 1.04, zIndex: 20 }}
          whileDrag={{ scale: 1.08, rotate: 0, zIndex: 30, cursor: "grabbing" }}
          variants={{
            hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 120, rotate: p.r * 3, scale: 0.85 },
            show: {
              opacity: 1,
              y: 0,
              rotate: p.r,
              scale: 1,
              transition: { duration: 1.1, delay: 0.15 + i * 0.14, ease },
            },
          }}
          className="absolute cursor-grab touch-none rounded-[0.9rem] bg-[#f4f1ea] p-2 pb-0 shadow-[0_24px_50px_-20px_rgb(0_0_0/0.9)] sm:p-2.5 sm:pb-0"
          style={{ left: p.x, top: p.y, width: p.w, zIndex: i + 1 }}
        >
          <div className="pointer-events-none aspect-[3/4] overflow-hidden rounded-[0.55rem] bg-onyx">
            <Picture image={byId(p.id)} sizes="(min-width: 1024px) 18rem, 46vw" objectPosition="50% 25%" />
          </div>
          <figcaption className="px-1 py-2 text-center font-display text-[0.8125rem] leading-tight text-ink sm:py-3 sm:text-[0.9375rem]">
            {p.caption}
          </figcaption>
        </motion.figure>
      ))}
    </motion.div>
  );
}
