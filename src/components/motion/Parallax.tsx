"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Píxeles que recorre mientras cruza la pantalla (negativo = sube más rápido). */
  distance?: number;
  className?: string;
};

/** Desplaza su contenido con el scroll, más lento o más rápido que la página. Solo transform. */
export function Parallax({ children, distance = 60, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [distance, -distance]);
  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}
