"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";

/**
 * Antes / después con una línea dorada que se arrastra (ratón, dedo o flechas del teclado).
 * `before` y `after` son lo que se pinta a cada lado (img, canvas…), del mismo tamaño.
 */
export function Compare({
  before,
  after,
  ratio,
  labels = ["Antes", "Después"],
  className = "",
  hint = true,
}: {
  before: ReactNode;
  after: ReactNode;
  ratio: string;
  labels?: [string, string];
  className?: string;
  hint?: boolean;
}) {
  const reduce = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(50);
  const [touched, setTouched] = useState(false);
  const dragging = useRef(false);

  const moveTo = (clientX: number) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
    setTouched(true);
  };
  const onDown = (e: PointerEvent) => {
    dragging.current = true;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    moveTo(e.clientX);
  };
  const onKey = (e: KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 3;
    if (e.key === "ArrowLeft") setPos((p) => Math.max(0, p - step));
    else if (e.key === "ArrowRight") setPos((p) => Math.min(100, p + step));
    else return;
    e.preventDefault();
    setTouched(true);
  };

  return (
    <div
      ref={box}
      className={`relative touch-pan-y select-none overflow-hidden rounded-[1.25rem] bg-ink ${className}`}
      style={{ aspectRatio: ratio }}
      onPointerDown={onDown}
      onPointerMove={(e) => dragging.current && moveTo(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
    >
      <div className="absolute inset-0 [&>*]:h-full [&>*]:w-full [&>*]:object-cover">{after}</div>
      <div
        className="absolute inset-0 [&>*]:h-full [&>*]:w-full [&>*]:object-cover"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        {before}
      </div>

      <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-ink/75 px-3 py-1 text-[0.8125rem] text-text">{labels[0]}</span>
      <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-ink/75 px-3 py-1 text-[0.8125rem] text-text">{labels[1]}</span>

      {/* la línea y su tirador */}
      <div className="pointer-events-none absolute inset-y-0 w-px bg-gold-light" style={{ left: `${pos}%` }}>
        <div
          role="slider"
          tabIndex={0}
          aria-label="Deslizar para comparar antes y después"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pos)}
          onKeyDown={onKey}
          className="pointer-events-auto absolute left-1/2 top-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize place-items-center rounded-full bg-gold text-ink shadow-[0_10px_30px_-10px_rgb(0_0_0/0.8)]"
        >
          <motion.svg
            viewBox="0 0 24 24"
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            animate={touched || reduce ? { x: 0 } : { x: [0, -3, 3, 0] }}
            transition={{ duration: 1.6, repeat: touched || reduce ? 0 : Infinity, repeatDelay: 1.2 }}
          >
            <path d="m9 7-5 5 5 5M15 7l5 5-5 5" />
          </motion.svg>
        </div>
      </div>
      {hint && !touched ? (
        <span className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-[0.8125rem] text-pearl/80">Desliza para comparar</span>
      ) : null}
    </div>
  );
}
