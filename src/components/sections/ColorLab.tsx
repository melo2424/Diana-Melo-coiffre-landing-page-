"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent, type RefObject } from "react";
import { portfolio, tones, type SiteImage } from "@/data/images";
import { bookingLink } from "@/data/site";
import { Picture } from "@/components/ui/Picture";
import { Reveal } from "@/components/motion/Reveal";
import { Lightbox, familyLabel } from "./Lightbox";

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * El círculo de tonos. Arriba los claros, abajo los profundos; a la derecha los cálidos
 * (dorados y cobres), a la izquierda los neutros y fríos. Dos tonos vecinos en el círculo
 * combinan entre sí: es la armonía análoga que usa una colorista al construir un balayage.
 */
const RING = [
  "Platino",
  "Vainilla",
  "Champaña",
  "Dorado",
  "Miel",
  "Cobre",
  "Chocolate",
  "Caramelo",
  "Arena",
  "Beige",
  "Ceniza",
  "Perla",
] as const;
type Tone = (typeof RING)[number];

const MAX = 3;

/** En el teléfono el lienzo es más ancho que el círculo: así los nombres caben a un tamaño legible (≈12px). */
const VIEW = {
  wide: { box: "-400 -320 800 640", ratio: "800 / 640", label: 21 },
  phone: { box: "-440 -300 880 600", ratio: "880 / 600", label: 30 },
};

function useWide() {
  const [wide, setWide] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const set = () => setWide(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);
  return wide;
}
const STEP = 360 / RING.length;
const R_IN = 128;
const R_OUT = 200;
const R_LABEL = 262;
const R_MIX = 112;

/* ------------------------------------------------------------------ geometría */

const polar = (r: number, deg: number) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [r * Math.cos(a), r * Math.sin(a)] as const;
};
const f = (n: number) => n.toFixed(2);

function sector(r0: number, r1: number, a0: number, a1: number) {
  const [x0, y0] = polar(r1, a0);
  const [x1, y1] = polar(r1, a1);
  const [x2, y2] = polar(r0, a1);
  const [x3, y3] = polar(r0, a0);
  return `M${f(x0)} ${f(y0)}A${r1} ${r1} 0 0 1 ${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}A${r0} ${r0} 0 0 0 ${f(x3)} ${f(y3)}Z`;
}

const hexToRgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const rgbToHex = (c: number[]) => `#${c.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;

/** Mezcla aditiva simple de las muestras elegidas (promedio en RGB). */
function mixOf(list: Tone[]) {
  if (!list.length) return { hex: "#17161a", light: false };
  const rgb = list.map((t) => hexToRgb(tones[t])).reduce((a, c) => a.map((v, i) => v + c[i] / list.length), [0, 0, 0]);
  const lum = (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;
  return { hex: rgbToHex(rgb), light: lum > 0.58 };
}

const neighbours = (t: Tone) => {
  const i = RING.indexOf(t);
  return [RING[(i + RING.length - 1) % RING.length], RING[(i + 1) % RING.length]];
};

const join = (list: string[]) =>
  list.length < 2 ? (list[0] ?? "") : `${list.slice(0, -1).join(", ")} y ${list[list.length - 1]}`;

/* ------------------------------------------------------------------ componente */

type Item = { image: SiteImage; kind: "match" | "vecino" };

export function ColorLab() {
  const reduce = useReducedMotion();
  const wide = useWide();
  const VB = wide ? VIEW.wide : VIEW.phone;
  const [picked, setPicked] = useState<Tone[]>(["Miel"]);
  const [hover, setHover] = useState<Tone | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);
  const labRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    portfolio.forEach((i) => i.tone && m.set(i.tone, (m.get(i.tone) ?? 0) + 1));
    return m;
  }, []);

  // La aguja dorada gira hasta el último tono elegido, por el camino más corto.
  const [angle, setAngle] = useState(RING.indexOf("Miel") * STEP);
  const toggle = (t: Tone) => {
    const next = picked.includes(t) ? picked.filter((x) => x !== t) : [...picked, t].slice(-MAX);
    setPicked(next);
    const last = next[next.length - 1];
    if (last) {
      const want = RING.indexOf(last) * STEP;
      setAngle((cur) => cur + ((((want - cur) % 360) + 540) % 360) - 180);
    }
  };

  const near = useMemo(
    () => [...new Set(picked.flatMap(neighbours))].filter((t) => !picked.includes(t)) as Tone[],
    [picked],
  );
  const items: Item[] = useMemo(() => {
    const byTone = (list: Tone[]) => list.flatMap((t) => portfolio.filter((i) => i.tone === t));
    return [
      ...byTone(picked).map((image) => ({ image, kind: "match" as const })),
      ...byTone(near).map((image) => ({ image, kind: "vecino" as const })),
    ];
  }, [picked, near]);
  const matches = items.filter((i) => i.kind === "match").length;
  const mix = mixOf(picked);

  // Al cambiar la mezcla, la tira vuelve al principio.
  useEffect(() => {
    trackRef.current?.scrollTo({ left: 0, behavior: reduce ? "auto" : "smooth" });
  }, [picked, reduce]);

  const needle = useSpring(angle, { stiffness: 70, damping: 16 });
  useEffect(() => {
    needle.set(angle);
  }, [needle, angle]);

  // La corona de marcas gira con el scroll de la página.
  const { scrollYProgress } = useScroll({ target: labRef, offset: ["start end", "end start"] });
  const ticksRotate = useTransform(scrollYProgress, [0, 1], [-50, 50]);

  const close = useCallback(() => {
    setOpen(null);
    requestAnimationFrame(() => lastTrigger.current?.focus());
  }, []);

  const names = picked.join(" + ");
  const wishMsg = picked.length
    ? `Hola Diana, armé mi color en tu web: ${names}. Quiero agendar una cita.`
    : "Hola Diana, vi tus trabajos y quiero agendar una cita.";

  return (
    <div ref={labRef} className="mt-16 md:mt-24">
      <div className="grid items-center gap-y-12 lg:grid-cols-12 lg:gap-x-5">
        {/* ---------------- el círculo ---------------- */}
        <Reveal order={1} className="lg:col-span-7">
          <div className="relative mx-auto w-full max-w-[44rem] select-none overflow-hidden" style={{ aspectRatio: VB.ratio }}>
            {/* corona de marcas: gira con el scroll */}
            <motion.svg
              aria-hidden
              viewBox={VB.box}
              className="absolute inset-0 h-full w-full"
              style={{ rotate: reduce ? 0 : ticksRotate }}
            >
              {Array.from({ length: 72 }, (_, i) => {
                const long = i % 6 === 0;
                const [x0, y0] = polar(long ? 218 : 223, i * 5);
                const [x1, y1] = polar(231, i * 5);
                return (
                  <line
                    key={i}
                    x1={f(x0)}
                    y1={f(y0)}
                    x2={f(x1)}
                    y2={f(y1)}
                    stroke={long ? "var(--gold)" : "var(--graphite)"}
                    strokeWidth={long ? 1.6 : 1.2}
                  />
                );
              })}
            </motion.svg>

            {/* aguja */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ rotate: needle }}
              animate={{ opacity: picked.length ? 1 : 0 }}
            >
              <svg viewBox={VB.box} className="h-full w-full">
                <path d="M0 -238 L-7 -250 L7 -250 Z" fill="var(--gold-light)" />
              </svg>
            </motion.div>

            {/* los doce tonos */}
            <motion.svg
              viewBox={VB.box}
              className="absolute inset-0 h-full w-full overflow-visible"
              role="group"
              aria-label={`Círculo de tonos: elige hasta ${MAX}`}
              initial={reduce ? false : "hidden"}
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } } }}
            >
              {RING.map((t, i) => (
                <Segment
                  key={t}
                  tone={t}
                  index={i}
                  count={counts.get(t) ?? 0}
                  active={picked.includes(t)}
                  near={near.includes(t)}
                  hovered={hover === t}
                  onHover={setHover}
                  onToggle={toggle}
                  label={VB.label}
                />
              ))}
              <motion.circle r={R_MIX} animate={{ fill: mix.hex }} transition={{ duration: reduce ? 0 : 0.8, ease }} />
              <circle r={R_MIX + 6} fill="none" stroke="var(--graphite)" strokeWidth={1} />
            </motion.svg>

            {/* centro: la mezcla */}
            <div
              aria-live="polite"
              className={`pointer-events-none absolute left-1/2 top-1/2 flex aspect-square w-[25%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full text-center transition-colors duration-500 ${
                mix.light ? "text-ink" : "text-pearl"
              }`}
            >
              <span className="text-[0.6875rem] uppercase tracking-[0.18em] opacity-75 md:text-[0.75rem]">
                {picked.length ? "Tu mezcla" : "Elige"}
              </span>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={names || "nada"}
                  initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                  transition={{ duration: reduce ? 0 : 0.35, ease }}
                  className="mt-1 px-2 font-display text-[0.9375rem] leading-[1.1] md:text-[1.375rem]"
                >
                  {picked.length ? picked.map((p) => <span key={p} className="block">{p}</span>) : "un tono"}
                </motion.span>
              </AnimatePresence>
            </div>

          </div>
          <div aria-hidden className="mx-auto mt-2 flex max-w-[44rem] justify-between text-small text-muted">
            <span>← Neutros y fríos</span>
            <span className="hidden sm:inline">Claros arriba, profundos abajo</span>
            <span>Cálidos →</span>
          </div>
        </Reveal>

        {/* ---------------- la mezcla ---------------- */}
        <Reveal order={2} className="lg:col-span-4 lg:col-start-9">
          <h3 className="font-display text-statement text-text">Arma tu color</h3>
          <p className="mt-4 max-w-[38ch] text-body text-text">
            Toca hasta {MAX} tonos del círculo. En el centro ves la mezcla; abajo, los trabajos de Diana en esos tonos
            y en los que quedan al lado.
          </p>

          <ul className="mt-6 flex min-h-11 flex-wrap gap-2" aria-label="Tonos elegidos">
            <AnimatePresence mode="popLayout" initial={false}>
              {picked.map((t) => (
                <motion.li
                  key={t}
                  layout
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: reduce ? 0 : 0.3, ease }}
                >
                  <button
                    type="button"
                    onClick={() => toggle(t)}
                    className="flex h-11 items-center gap-2.5 bg-graphite pl-2 pr-3 text-small text-text transition-colors hover:bg-onyx"
                    aria-label={`Quitar ${t}`}
                  >
                    <span aria-hidden className="size-6" style={{ background: tones[t] }} />
                    {t}
                    <span aria-hidden className="text-muted">×</span>
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          <p className="mt-6 min-h-[3.2em] max-w-[38ch] text-small text-muted">
            {near.length
              ? `Al lado en el círculo: ${join(near)}. Combinan con tu elección, por eso sus trabajos también aparecen.`
              : "Sin tonos elegidos. Empieza por el que más se parezca al color que quieres."}
          </p>

          <a
            href={bookingLink(wishMsg)}
            target="_blank"
            rel="noopener"
            className="group mt-6 inline-flex h-12 items-center gap-3 bg-accent px-6 text-body font-medium text-on-accent transition-colors duration-[var(--dur-fast)] hover:bg-gold-light active:translate-y-px"
          >
            {picked.length ? "Quiero esta mezcla" : "Agendar mi cita"}
            <span aria-hidden className="transition-transform duration-[var(--dur-base)] group-hover:translate-x-1">
              →
            </span>
          </a>
        </Reveal>
      </div>

      {/* ---------------- la tira de trabajos ---------------- */}
      <Strip
        items={items}
        matches={matches}
        trackRef={trackRef}
        onOpen={(i, el) => {
          lastTrigger.current = el;
          setOpen(i);
        }}
      />

      <AnimatePresence>
        {open !== null ? (
          <Lightbox
            key="lab-lightbox"
            scope="lab"
            items={items.map((i) => i.image)}
            index={open}
            onIndex={setOpen}
            onClose={close}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ un tono del círculo */

const segVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6, ease } },
};

function Segment({
  tone,
  index,
  count,
  active,
  near,
  hovered,
  onHover,
  onToggle,
  label,
}: {
  tone: Tone;
  index: number;
  count: number;
  active: boolean;
  near: boolean;
  hovered: boolean;
  onHover: (t: Tone | null) => void;
  onToggle: (t: Tone) => void;
  label: number;
}) {
  const reduce = useReducedMotion();
  const [focused, setFocused] = useState(false);
  const mid = index * STEP;
  const lift = active ? 16 : hovered || focused ? 7 : 0;
  const [dx, dy] = polar(lift, mid);
  const [lx, ly] = polar(R_LABEL, mid);
  const anchor = mid === 0 || mid === 180 ? "middle" : mid < 180 ? "start" : "end";

  return (
    <motion.g
      variants={segVariants}
      role="checkbox"
      aria-checked={active}
      aria-label={`${tone}: ${count} ${count === 1 ? "trabajo" : "trabajos"}`}
      tabIndex={0}
      className="cursor-pointer outline-none"
      onClick={() => onToggle(tone)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle(tone);
        }
      }}
      onPointerEnter={() => onHover(tone)}
      onPointerLeave={() => onHover(null)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      {/* zona de toque: toda la cuña, del anillo hasta el nombre */}
      <path d={sector(R_IN, R_LABEL + 14, mid - STEP / 2, mid + STEP / 2)} fill="transparent" />
      <motion.g animate={{ x: dx, y: dy }} transition={{ type: "spring", stiffness: 260, damping: 22, ...(reduce ? { duration: 0 } : {}) }}>
        <path
          d={sector(R_IN, R_OUT, mid - STEP / 2 + 1.2, mid + STEP / 2 - 1.2)}
          fill={tones[tone]}
          stroke={active ? "var(--gold-light)" : focused ? "var(--pearl)" : "transparent"}
          strokeWidth={active ? 3 : 2}
        />
        {/* arco de armonía: los vecinos de lo elegido */}
        <motion.path
          d={sector(R_OUT + 7, R_OUT + 10, mid - STEP / 2 + 1.2, mid + STEP / 2 - 1.2)}
          fill="var(--gold)"
          initial={false}
          animate={{ opacity: near ? 0.85 : active ? 1 : 0 }}
          transition={{ duration: 0.4 }}
        />
      </motion.g>
      <text
        x={f(lx)}
        y={f(ly)}
        textAnchor={anchor}
        dominantBaseline="middle"
        className="font-sans transition-[fill] duration-300"
        fontSize={label}
        fill={active ? "var(--gold-light)" : hovered || focused ? "var(--pearl)" : "var(--stone)"}
      >
        {tone}
        <tspan dx={label * 0.25} dy={-label * 0.38} fontSize={label * 0.62} fill="var(--stone)">
          {count}
        </tspan>
      </text>
    </motion.g>
  );
}

/* ------------------------------------------------------------------ la tira */

function Strip({
  items,
  matches,
  trackRef,
  onOpen,
}: {
  items: Item[];
  matches: number;
  trackRef: RefObject<HTMLUListElement | null>;
  onOpen: (index: number, el: HTMLButtonElement) => void;
}) {
  const reduce = useReducedMotion();
  const { scrollXProgress } = useScroll({ container: trackRef });
  const bar = useSpring(scrollXProgress, { stiffness: 120, damping: 24 });
  const near = items.length - matches;

  // Arrastrar con el ratón en escritorio (el dedo y el trackpad ya desplazan solos).
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const [dragging, setDragging] = useState(false);
  const onDown = (e: PointerEvent<HTMLUListElement>) => {
    if (e.pointerType !== "mouse" || !trackRef.current) return;
    drag.current = { x: e.clientX, left: trackRef.current.scrollLeft, moved: false };
  };
  const onMove = (e: PointerEvent<HTMLUListElement>) => {
    const d = drag.current;
    if (!d || !trackRef.current) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 6) {
      d.moved = true;
      setDragging(true);
    }
    if (d.moved) trackRef.current.scrollLeft = d.left - dx;
  };
  const onUp = () => {
    setTimeout(() => {
      drag.current = null;
      setDragging(false);
    }, 0);
  };

  const page = (dir: number) => {
    const el = trackRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div className="mt-14 md:mt-20">
      <div className="flex items-end justify-between gap-6">
        <p className="text-body text-text" aria-live="polite">
          {items.length ? (
            <>
              {matches} {matches === 1 ? "trabajo" : "trabajos"} en tu mezcla
              {near ? <span className="text-muted"> · {near} en tonos vecinos</span> : null}
            </>
          ) : (
            "Elige un tono en el círculo para ver sus trabajos."
          )}
        </p>
        <div className="hidden gap-2 md:flex">
          {[-1, 1].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => page(d)}
              aria-label={d < 0 ? "Trabajos anteriores" : "Más trabajos"}
              className="grid size-12 place-items-center bg-onyx text-body text-text transition-colors hover:bg-graphite hover:text-gold-light"
            >
              {d < 0 ? "←" : "→"}
            </button>
          ))}
        </div>
      </div>

      <ul
        ref={trackRef}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        className={`relative -mx-gutter mt-6 flex gap-3 overflow-x-auto px-gutter pb-2 [scrollbar-width:none] md:gap-4 [&::-webkit-scrollbar]:hidden ${
          dragging ? "cursor-grabbing" : "snap-x snap-mandatory md:cursor-grab"
        }`}
        style={{ scrollPaddingInline: "var(--gutter)" }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {items.map((item, i) => (
            <Card
              key={`${item.kind}-${item.image.id}`}
              item={item}
              index={i}
              trackRef={trackRef}
              first={item.kind === "vecino" && (i === 0 || items[i - 1].kind === "match")}
              onOpen={(el) => !drag.current?.moved && onOpen(i, el)}
            />
          ))}
        </AnimatePresence>
      </ul>

      {/* avance de la tira */}
      <div aria-hidden className="mt-5 h-px bg-graphite">
        <motion.div className="h-full origin-left bg-gold" style={{ scaleX: bar }} />
      </div>
    </div>
  );
}

function Card({
  item,
  index,
  trackRef,
  first,
  onOpen,
}: {
  item: Item;
  index: number;
  trackRef: RefObject<HTMLUListElement | null>;
  first: boolean;
  onOpen: (el: HTMLButtonElement) => void;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLLIElement>(null);
  // Paralaje horizontal: la foto se desliza dentro de su marco al recorrer la tira.
  const { scrollXProgress } = useScroll({ container: trackRef, target: ref, axis: "x", offset: ["start end", "end start"] });
  const x = useTransform(scrollXProgress, [0, 1], reduce ? ["0%", "0%"] : ["-9%", "9%"]);
  const { image } = item;

  return (
    <motion.li
      ref={ref}
      layout={!reduce}
      initial={reduce ? false : { opacity: 0, x: 90 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.22 } }}
      transition={{ duration: 0.8, delay: Math.min(index, 8) * 0.06, ease }}
      className={`w-[68vw] shrink-0 snap-start sm:w-[40vw] md:w-[26vw] lg:w-[19vw] ${first ? "ml-6 md:ml-10" : ""}`}
    >
      <button
        type="button"
        className="tile group block w-full text-left"
        onClick={(e) => onOpen(e.currentTarget)}
        aria-label={`Ver en grande: ${image.alt}`}
        draggable={false}
      >
        <motion.div
          layoutId={`lab-${image.id}`}
          className="relative aspect-[3/4] overflow-hidden bg-onyx"
          initial={reduce ? false : { clipPath: "inset(0 0 0 100%)" }}
          animate={{ clipPath: "inset(0 0 0 0%)" }}
          transition={{ duration: 0.9, delay: Math.min(index, 8) * 0.06 + 0.05, ease }}
        >
          <motion.div className="absolute inset-y-0 -left-[10%] w-[120%]" style={{ x }}>
            <Picture image={image} sizes="(min-width: 1024px) 20vw, (min-width: 768px) 27vw, 68vw" objectPosition="50% 30%" className="tile-img pointer-events-none" />
          </motion.div>
          {item.kind === "vecino" ? (
            <span className="absolute left-0 top-0 bg-ink/80 px-2.5 py-1 text-small text-text">Tono vecino</span>
          ) : null}
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
  );
}
