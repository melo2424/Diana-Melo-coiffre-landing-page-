"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Orden dentro de la sección: 0 título, 1 texto, 2 imagen… (×70ms) */
  order?: number;
  className?: string;
  as?: "div" | "li" | "figure";
};

/**
 * Entrada estándar: sube 24px y aparece, una sola vez, al entrar en pantalla.
 * Con prefers-reduced-motion solo aparece (sin desplazamiento).
 * Sin JavaScript el contenido se muestra igual (ver <noscript> en layout).
 */
export function Reveal({ children, order = 0, className, as = "div" }: Props) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  return (
    <Tag
      data-reveal
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: reduce ? 0.2 : 0.8, delay: order * 0.07, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Tag>
  );
}
