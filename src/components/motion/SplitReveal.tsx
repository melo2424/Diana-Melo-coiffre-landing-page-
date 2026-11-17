"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Fragment, type CSSProperties } from "react";

type Props = {
  /** Una entrada por línea. Cada palabra sube desde detrás de una máscara. */
  lines: string[];
  as?: "h1" | "h2" | "p" | "span";
  id?: string;
  className?: string;
  /** Clases por línea (p. ej. sangría de la segunda línea). */
  lineClassNames?: string[];
  delay?: number;
  /** true: anima al montar (hero). false: al entrar en pantalla. */
  immediate?: boolean;
  style?: CSSProperties;
};

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Titular que se descubre palabra a palabra, cada una saliendo de una máscara.
 * El texto real está siempre en el DOM (lectores de pantalla y sin JS lo leen completo).
 */
export function SplitReveal({
  lines,
  as = "h2",
  id,
  className,
  lineClassNames = [],
  delay = 0,
  immediate = false,
  style,
}: Props) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  let wordIndex = 0;

  const trigger = immediate
    ? { initial: "hidden", animate: "shown" }
    : { initial: "hidden", whileInView: "shown", viewport: { once: true, amount: 0.1 } };

  return (
    <Tag id={id} className={className} style={style} {...trigger}>
      {lines.map((line, li) => (
        <span key={li} className={`block ${lineClassNames[li] ?? ""}`}>
          {line.split(" ").map((word, wi) => {
            const i = wordIndex++;
            return (
              <Fragment key={wi}>
              <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                <motion.span
                  data-reveal
                  className="inline-block"
                  variants={{
                    hidden: { y: reduce ? 0 : "105%", opacity: reduce ? 0 : 1 },
                    shown: {
                      y: 0,
                      opacity: 1,
                      transition: { duration: reduce ? 0.3 : 1.05, delay: delay + i * 0.08, ease },
                    },
                  }}
                >
                  {word}
                </motion.span>
              </span>
                {wi < line.split(" ").length - 1 ? " " : null}
              </Fragment>
            );
          })}
        </span>
      ))}
    </Tag>
  );
}
