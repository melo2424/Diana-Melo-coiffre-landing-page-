"use client";

import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { bookingHref } from "@/data/site";
import { Monogram, Tagline, Wordmark } from "@/components/brand/Logo";
import { Cta } from "@/components/ui/Cta";

const ease = [0.22, 1, 0.36, 1] as const;

const photo = {
  src: "/images/marca/banner-rubio-735.webp",
  srcSet:
    "/images/marca/banner-rubio-490.webp 490w, /images/marca/banner-rubio-735.webp 735w, /images/marca/banner-rubio-980.webp 980w",
  alt: "Modelo rubia con ondas largas y corona de flores, imagen de campaña de Diana Melo Coiffure.",
};

/**
 * El banner de la marca, reconstruido: la foto a la izquierda y el panel negro que la corta en
 * diagonal, con el logotipo oficial. El panel entra barriendo desde la derecha, el monograma se
 * dibuja, las letras suben una a una y un brillo dorado las recorre (y sigue al cursor).
 * Al bajar, el panel avanza sobre la foto como un telón.
 */
export function Hero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  // En móvil el texto va debajo de la foto: no se desvanece mientras se lee.
  const [desk, setDesk] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const set = () => setDesk(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);
  const still = reduce || !desk;

  // Entrada del panel (0 → 1) y salida con el scroll (0 → 1). Ambas viven como variables CSS
  // para que el recorte en diagonal (clip-path en globals.css) se calcule en el navegador.
  const enter = useMotionValue(reduce ? 1 : 0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const leave = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 1]);
  const photoY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 160]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, still ? 0 : -90]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // Brillo: cruza el nombre una vez al llegar; después, en escritorio, sigue al cursor.
  const sheenTarget = useMotionValue(300);
  const sheen = useSpring(sheenTarget, { stiffness: 60, damping: 20, mass: 0.6 });

  useEffect(() => {
    if (reduce) {
      enter.set(1);
      return;
    }
    const panel = animate(enter, 1, { duration: 1.25, delay: 0.15, ease: [0.76, 0, 0.24, 1] });
    const sweep = animate(sheenTarget, 1900, { delay: 2.3, duration: 2.2, ease: "easeInOut" });
    return () => {
      panel.stop();
      sweep.stop();
    };
  }, [reduce, enter, sheenTarget]);

  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const t = (e.clientX - r.left) / r.width; // 0 → 1 a lo ancho del hero
    sheenTarget.set(300 + t * 1500);
  };

  return (
    <motion.section
      ref={ref}
      id="inicio"
      aria-labelledby="titulo"
      onPointerMove={onPointerMove}
      className="hero relative isolate overflow-hidden bg-ink pt-header"
      style={{ "--in": enter, "--out": leave } as never}
    >
      <div className="relative lg:h-[var(--hh)]">
        {/* La foto de campaña */}
        <div className="hero-photo relative h-[64svh] min-h-[26rem] overflow-hidden bg-onyx lg:absolute lg:inset-y-0 lg:left-0 lg:h-full lg:min-h-0">
          <motion.div className="absolute inset-0" style={{ y: photoY }}>
            <picture>
            {/* En móvil, un recorte que termina antes de la diagonal negra de la pieza original */}
            <source
              media="(max-width: 1023px)"
              srcSet="/images/marca/banner-rubio-movil-332.webp 332w, /images/marca/banner-rubio-movil-664.webp 664w"
              sizes="100vw"
              width={332}
              height={742}
            />
            <motion.img
              src={photo.src}
              srcSet={photo.srcSet}
              sizes="(min-width: 1024px) 48vw, 100vw"
              width={490}
              height={742}
              alt={photo.alt}
              fetchPriority="high"
              decoding="async"
              className="h-full w-full object-cover object-[50%_18%] lg:object-right"
              initial={reduce ? false : { scale: 1.14, opacity: 0, filter: "brightness(0.4)" }}
              animate={{ scale: 1, opacity: 1, filter: "brightness(1)" }}
              transition={{ duration: 2.4, ease }}
            />
            </picture>
          </motion.div>
        </div>

        {/* Filo dorado y panel negro: mismo corte en diagonal, el filo asoma 2px */}
        <div aria-hidden className="hero-edge pointer-events-none absolute inset-0 hidden bg-gold lg:block" />
        <div className="hero-panel relative z-10 -mt-[28vw] bg-ink pt-[24vw] lg:absolute lg:inset-0 lg:mt-0 lg:pt-0">
          {/* El mismo rostro, apagado, detrás del logotipo: como en la pieza original */}
          <div aria-hidden className="absolute inset-0 overflow-hidden">
            {/* Ya optimizada a mano (WebP de 7 KB): next/image no aporta nada aquí */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/marca/banner-rubio-sombra.webp"
              alt=""
              width={360}
              height={545}
              decoding="async"
              className="hero-ghost h-full w-full object-cover object-[50%_30%] opacity-[0.28] lg:ml-[18%] lg:w-[82%]"
            />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_45%,transparent_0%,var(--ink)_78%)]" />
          </div>

          <motion.div
            style={{ y: contentY, opacity: still ? 1 : contentOpacity }}
            className="hero-content relative flex flex-col items-center px-gutter pb-16 text-center lg:absolute lg:inset-y-0 lg:right-0 lg:justify-center lg:pb-0"
          >
            <h1 id="titulo" className="flex w-[min(84vw,30rem)] flex-col items-center lg:w-[min(32vw,34rem)]">
              <span className="sr-only">Diana Melo Coiffure, estilista profesional</span>
              <Monogram delay={0.9} className="w-[44%]" />
              <Wordmark delay={1.55} sheen={sheen} className="mt-[7%] w-full overflow-visible" />
              <Tagline delay={2.25} className="mt-[5.5%] w-[56%]" />
            </h1>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 2.5, ease }}
              className="mt-10 flex flex-col items-center lg:mt-12"
            >
              <p className="max-w-[34ch] text-body text-text">
                Colorista en Villavicencio: balayage, rubios y cobrizos hechos a la medida de tu cabello.
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
                <Cta href={bookingHref} size="lg">
                  Agendar cita
                </Cta>
                <Cta href="#trabajos" variant="ghost" size="lg">
                  Ver los trabajos
                </Cta>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
