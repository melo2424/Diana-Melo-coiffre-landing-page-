"use client";

import { motion, useReducedMotion, type MotionValue, type Variants } from "framer-motion";
import { useId } from "react";
import { BOX, COIFFURE, LETTERS, MONO, TAG, WORD } from "./logo-paths";

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * El logotipo aprobado, animado. Las formas son las del PNG oficial (vectorizado):
 * aquí solo se decide cómo entran en escena, nunca la tipografía.
 *
 * play="mount"  → la animación arranca al cargar (hero).
 * play="inView" → arranca cuando entra en pantalla (footer).
 */
type Play = "mount" | "inView";
type Tone = "gold" | "ivory";

const GOLD_STOPS: [number, string][] = [
  [0, "#8f6e35"],
  [0.28, "#e7d3a1"],
  [0.5, "#c6a15b"],
  [0.74, "#f1e2b8"],
  [1, "#9c7a3c"],
];

function trigger(play: Play, reduce: boolean | null) {
  if (reduce) return { initial: false as const, animate: "show" };
  return play === "mount"
    ? { initial: "hidden", animate: "show" }
    : { initial: "hidden", whileInView: "show", viewport: { once: true, amount: 0.35 } };
}

/* ---------------------------------------------------------------- monograma */

export function Monogram({
  play = "mount",
  delay = 0,
  tone = "ivory",
  coiffure = true,
  className = "",
}: {
  play?: Play;
  delay?: number;
  tone?: Tone;
  coiffure?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const fill = tone === "gold" ? `url(#${uid}-g)` : "var(--ivory)";
  const draw: Variants = {
    hidden: { pathLength: 0, fillOpacity: 0, strokeOpacity: 1 },
    show: {
      pathLength: 1,
      fillOpacity: 1,
      strokeOpacity: 0,
      transition: {
        pathLength: { delay, duration: 1.9, ease: [0.65, 0, 0.35, 1] },
        fillOpacity: { delay: delay + 1.2, duration: 0.9, ease: "easeOut" },
        strokeOpacity: { delay: delay + 1.9, duration: 0.6 },
      },
    },
  };
  const rise: Variants = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { delay: delay + 1.1, duration: 1.1, ease } },
  };

  return (
    <motion.svg viewBox={BOX.mono} aria-hidden focusable="false" className={className} {...trigger(play, reduce)}>
      {tone === "gold" ? <Gold id={`${uid}-g`} x1={30} x2={385} /> : null}
      <motion.path
        d={MONO}
        fillRule="evenodd"
        fill={fill}
        stroke={tone === "gold" ? "#e7d3a1" : "var(--ivory)"}
        strokeWidth={1.4}
        variants={draw}
      />
      {coiffure ? <motion.path d={COIFFURE} fillRule="evenodd" fill={fill} variants={rise} /> : null}
    </motion.svg>
  );
}

/* ---------------------------------------------------------------- DianaMelo */

export function Wordmark({
  play = "mount",
  delay = 0,
  tone = "gold",
  sheen,
  className = "",
}: {
  play?: Play;
  delay?: number;
  tone?: Tone;
  /** Posición del brillo en coordenadas del logotipo (540 → 1762). Sin él, no hay brillo. */
  sheen?: MotionValue<number>;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const fill = tone === "gold" ? `url(#${uid}-g)` : "var(--ivory)";
  const letter: Variants = {
    hidden: { y: 230 },
    show: (i: number) => ({ y: 0, transition: { delay: delay + i * 0.075, duration: 1.15, ease } }),
  };

  return (
    <motion.svg viewBox={BOX.word} aria-hidden focusable="false" className={className} {...trigger(play, reduce)}>
      <defs>
        {tone === "gold" ? <Gold id={`${uid}-g`} x1={540} x2={1762} /> : null}
        {LETTERS.map((l, i) => (
          <clipPath key={i} id={`${uid}-l${i}`}>
            <polygon points={l.points} />
          </clipPath>
        ))}
        {sheen ? (
          <>
            <clipPath id={`${uid}-w`}>
              <path d={WORD} clipRule="evenodd" />
            </clipPath>
            <linearGradient id={`${uid}-s`} x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#fff" stopOpacity="0" />
              <stop offset="0.5" stopColor="#fff8e6" stopOpacity="0.75" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
          </>
        ) : null}
      </defs>

      {LETTERS.map((l, i) => (
        <g key={i} clipPath={`url(#${uid}-l${i})`}>
          <motion.path d={WORD} fillRule="evenodd" fill={fill} custom={i} variants={letter} />
        </g>
      ))}

      {sheen && !reduce ? (
        <g clipPath={`url(#${uid}-w)`} style={{ mixBlendMode: "screen" }}>
          <motion.rect y={140} width={220} height={230} fill={`url(#${uid}-s)`} style={{ x: sheen, skewX: -18 }} />
        </g>
      ) : null}
    </motion.svg>
  );
}

/* ---------------------------------------------------------------- STYLISTE PROFESSIONNEL */

export function Tagline({
  play = "mount",
  delay = 0,
  tone = "gold",
  className = "",
}: {
  play?: Play;
  delay?: number;
  tone?: Tone;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const variants: Variants = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { delay, duration: 1, ease } },
  };
  return (
    <motion.svg viewBox={BOX.tag} aria-hidden focusable="false" className={className} {...trigger(play, reduce)}>
      {tone === "gold" ? <Gold id={`${uid}-g`} x1={910} x2={1395} /> : null}
      <motion.path
        d={TAG}
        fillRule="evenodd"
        fill={tone === "gold" ? `url(#${uid}-g)` : "var(--ivory)"}
        variants={variants}
      />
    </motion.svg>
  );
}

/* ---------------------------------------------------------------- versión horizontal, pequeña (cabecera) */

export function LogoInline({ showWord = true, className = "" }: { showWord?: boolean; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <svg viewBox="30 30 1735 380" aria-hidden focusable="false" className={className}>
      <path d={MONO} fillRule="evenodd" fill="currentColor" />
      <motion.g
        initial={false}
        animate={{ opacity: showWord ? 1 : 0, x: showWord ? 0 : -60 }}
        transition={{ duration: reduce ? 0 : 0.6, ease }}
      >
        <path d={WORD} fillRule="evenodd" fill="currentColor" />
      </motion.g>
    </svg>
  );
}

function Gold({ id, x1, x2 }: { id: string; x1: number; x2: number }) {
  return (
    <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={x1} x2={x2} y1="0" y2="40">
      {GOLD_STOPS.map(([o, c]) => (
        <stop key={o} offset={o} stopColor={c} />
      ))}
    </linearGradient>
  );
}
