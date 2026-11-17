import type { ReactNode } from "react";

type Props = {
  id?: string;
  title: ReactNode;
  /** Una frase que dice qué hay en la sección. Va directamente debajo del título. */
  lede?: ReactNode;
  /** dark = sobre --ink/--onyx (por defecto); light = sobre --ivory/--pearl */
  tone?: "dark" | "light";
  as?: "h2" | "h3";
  className?: string;
};

/**
 * Título de sección. Sin eyebrow, sin numeración, sin palabra destacada.
 * Máximo dos líneas en cualquier ancho: si no cabe, se acortan las palabras.
 */
export function SectionHeading({ id, title, lede, tone = "dark", as: Tag = "h2", className = "" }: Props) {
  const ledeColor = tone === "dark" ? "text-text" : "text-ink";
  return (
    <div className={`max-w-[46rem] ${className}`}>
      <Tag id={id} className={`text-title ${tone === "dark" ? "text-text" : "text-ink"}`}>
        {title}
      </Tag>
      {lede ? <p className={`mt-6 max-w-[38rem] text-body md:mt-8 ${ledeColor}`}>{lede}</p> : null}
    </div>
  );
}
