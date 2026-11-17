"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";
import { families, tones, type SiteImage } from "@/data/images";
import { bookingLink } from "@/data/site";
import { Picture } from "@/components/ui/Picture";

const ease = [0.22, 1, 0.36, 1] as const;
export const familyLabel = (id: string) => families.find((f) => f.id === id)?.label ?? id;

/** Visor a pantalla completa: Escape cierra, flechas navegan, el foco queda dentro. */
export function Lightbox({
  items,
  index,
  onIndex,
  onClose,
  scope = "photo",
}: {
  items: SiteImage[];
  /** Prefijo del layoutId: la misma foto puede estar en el muro y en el laboratorio. */
  scope?: string;
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const image = items[index];
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const go = useCallback((d: number) => onIndex((index + d + items.length) % items.length), [index, items.length, onIndex]);

  useEffect(() => {
    closeRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "Tab" && dialogRef.current) {
        const f = dialogRef.current.querySelectorAll<HTMLElement>("a, button");
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  return (
    <motion.div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Trabajo en tono ${image.tone}`}
      className="fixed inset-0 z-[70] grid bg-ink/[0.97] px-gutter py-5 md:grid-cols-12 md:gap-x-5 md:py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex min-h-0 items-center justify-center md:col-span-7 md:col-start-1" onClick={onClose}>
        <motion.div
          layoutId={`${scope}-${image.id}`}
          className="relative max-h-[62svh] overflow-hidden bg-onyx md:max-h-[86svh]"
          style={{ aspectRatio: `${image.width} / ${image.height}` }}
          transition={{ duration: reduce ? 0 : 0.6, ease }}
          onClick={(e) => e.stopPropagation()}
        >
          <Picture image={image} sizes="(min-width: 768px) 50vw, 92vw" className="h-full w-auto" />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease }}
        className="flex flex-col justify-between gap-6 pt-5 md:col-span-4 md:col-start-9 md:pt-0"
      >
        <div className="flex justify-end">
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="h-11 text-body text-text underline decoration-gold/70 decoration-2 underline-offset-[7px] hover:text-gold-light"
          >
            Cerrar
          </button>
        </div>

        <div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease }}
            >
              <p className="flex items-center gap-3 font-display text-title text-text">
                <span aria-hidden className="inline-block size-[0.5em]" style={{ background: tones[image.tone ?? ""] }} />
                {image.tone}
              </p>
              <p className="mt-4 text-small text-muted">{familyLabel(image.category)}</p>
              <p className="mt-5 max-w-[38ch] text-body text-text">{image.alt}.</p>
            </motion.div>
          </AnimatePresence>
          <a
            href={bookingLink(`Hola Diana, vi tu trabajo en tono ${image.tone} y quiero un color así.`)}
            target="_blank"
            rel="noopener"
            className="mt-8 inline-flex h-12 items-center gap-3 bg-accent px-6 text-body font-medium text-on-accent transition-colors hover:bg-gold-light"
          >
            Quiero este tono <span aria-hidden>→</span>
          </a>
        </div>

        <div className="flex items-center justify-between text-body">
          <button type="button" onClick={() => go(-1)} className="h-11 px-1 text-text hover:text-gold-light">
            ← Anterior
          </button>
          <span className="tabular text-small text-muted">
            {index + 1} de {items.length}
          </span>
          <button type="button" onClick={() => go(1)} className="h-11 px-1 text-text hover:text-gold-light">
            Siguiente →
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
