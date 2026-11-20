"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import { portfolio, tones } from "@/data/images";
import { questions, recommend, summary, type Answers } from "@/lib/quiz";
import { prefillBooking, tryTone } from "@/lib/store";
import { track } from "@/lib/track";
import { Picture } from "@/components/ui/Picture";
import { CtaButton } from "@/components/ui/Cta";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Reveal } from "@/components/motion/Reveal";

const ease = [0.22, 1, 0.36, 1] as const;

/** Mini diagnóstico: cinco toques, una recomendación y la agenda ya llena. */
export function Quiz() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [a, setA] = useState<Answers>({});
  const done = i >= questions.length;
  const result = useMemo(() => (done ? recommend(a) : null), [done, a]);
  const works = useMemo(() => (result ? portfolio.filter((p) => p.category === result.family).slice(0, 3) : []), [result]);

  const go = (n: number, ans: Answers = a) => {
    setDir(n > i ? 1 : -1);
    setI(n);
    if (n === questions.length) track("Quiz completado", { resultado: recommend(ans).title });
  };

  const q = questions[Math.min(i, questions.length - 1)];
  const multi = "multi" in q && q.multi;
  const value = a[q.key as keyof Answers];
  const picked = (v: string) => (multi ? ((value as string[] | undefined) ?? []).includes(v) : value === v);

  const choose = (v: string) => {
    if (multi) {
      const list = (a.history ?? []).filter((x) => x !== "Nada");
      const next = v === "Nada" ? ["Nada"] : list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
      setA({ ...a, history: next });
      return;
    }
    const next = { ...a, [q.key]: v };
    setA(next);
    // avance automático en preguntas de una sola respuesta
    setTimeout(() => go(i + 1, next), reduce ? 0 : 260);
  };

  const variants = {
    enter: (d: number) => ({ opacity: 0, x: reduce ? 0 : d * 60 }),
    center: { opacity: 1, x: 0, transition: { duration: 0.45, ease } },
    exit: (d: number) => ({ opacity: 0, x: reduce ? 0 : d * -60, transition: { duration: 0.2 } }),
  };

  return (
    <section id="diagnostico" aria-labelledby="diagnostico-titulo" className="px-gutter pt-section">
      <div className="grid gap-y-10 lg:grid-cols-12 lg:gap-x-10">
        <div className="lg:col-span-4">
          <SplitReveal id="diagnostico-titulo" lines={["¿Qué color", "te va?"]} className="text-title text-text" />
          <Reveal order={1}>
            <p className="mt-6 max-w-[34ch] text-body text-text">
              Cinco preguntas rápidas y te digo por dónde empezar. Lo que respondas le llega a Diana con tu cita.
            </p>
          </Reveal>
        </div>

        <Reveal order={2} className="min-w-0 lg:col-span-8">
          <div className="relative overflow-hidden rounded-[1.75rem] bg-onyx p-5 ring-1 ring-white/5 sm:p-8">
            {/* progreso */}
            <div className="flex items-center gap-1.5" aria-hidden>
              {questions.map((_, n) => (
                <span key={n} className="h-1 flex-1 overflow-hidden rounded-full bg-graphite">
                  <motion.span
                    className="block h-full origin-left rounded-full bg-gold"
                    initial={false}
                    animate={{ scaleX: n < i || done ? 1 : n === i ? 0.35 : 0 }}
                    transition={{ duration: 0.5, ease }}
                  />
                </span>
              ))}
            </div>

            <AnimatePresence mode="wait" custom={dir} initial={false}>
              {!done ? (
                <motion.div key={q.key} custom={dir} variants={variants} initial="enter" animate="center" exit="exit" className="mt-8">
                  <p className="text-small text-muted">
                    Pregunta {i + 1} de {questions.length}
                  </p>
                  <h3 className="mt-2 font-display text-[1.75rem] leading-tight text-text md:text-[2.125rem]">{q.title}</h3>
                  {multi ? <p className="mt-1 text-small text-muted">Puedes elegir varias.</p> : null}

                  <div className={`mt-6 grid gap-2.5 ${q.key === "depth" ? "grid-cols-5" : "sm:grid-cols-2"}`}>
                    {q.options.map((o) => {
                      const on = picked(o.value);
                      const sw = "swatch" in o ? o.swatch : null;
                      return sw ? (
                        <button
                          key={o.value}
                          type="button"
                          aria-pressed={on}
                          onClick={() => choose(o.value)}
                          className="group flex flex-col items-center gap-2 text-center"
                        >
                          <span
                            className={`swatch aspect-square w-full max-w-[4.5rem] transition-transform duration-300 group-hover:scale-105 ${on ? "ring-2 ring-gold ring-offset-4 ring-offset-onyx" : ""}`}
                            style={{ background: sw }}
                          />
                          <span className={`text-[0.8125rem] leading-tight ${on ? "text-gold-light" : "text-muted group-hover:text-text"}`}>{o.label}</span>
                        </button>
                      ) : (
                        <button
                          key={o.value}
                          type="button"
                          aria-pressed={on}
                          onClick={() => choose(o.value)}
                          className={`flex min-h-14 items-center justify-between gap-3 rounded-2xl px-5 py-3 text-left transition-[background-color,box-shadow,color] duration-300 ${
                            on ? "bg-gold text-ink" : "bg-ink text-text ring-1 ring-graphite hover:ring-gold/60"
                          }`}
                        >
                          <span>
                            <span className="block text-body">{o.label}</span>
                            {"hint" in o && o.hint ? <span className={`block text-[0.8125rem] ${on ? "text-ink/70" : "text-muted"}`}>{o.hint}</span> : null}
                          </span>
                          <span
                            aria-hidden
                            className={`grid size-6 shrink-0 place-items-center rounded-full text-[0.75rem] ${on ? "bg-ink text-gold-light" : "ring-1 ring-graphite"}`}
                          >
                            {on ? "✓" : ""}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-8 flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => go(i - 1)}
                      disabled={i === 0}
                      className="text-small text-muted hover:text-gold-light disabled:invisible"
                    >
                      ← Atrás
                    </button>
                    {multi ? (
                      <CtaButton disabled={!a.history?.length} onClick={() => go(i + 1)}>
                        Siguiente
                      </CtaButton>
                    ) : null}
                  </div>
                </motion.div>
              ) : result ? (
                <motion.div key="resultado" custom={dir} variants={variants} initial="enter" animate="center" exit="exit" className="mt-8">
                  <p className="text-small text-muted">Te recomiendo empezar por</p>
                  <h3 className="mt-2 font-display text-[2rem] leading-tight text-gold-light md:text-[2.5rem]">{result.title}</h3>
                  <p className="mt-3 max-w-[52ch] text-body text-text">{result.text}</p>

                  {result.tones.length ? (
                    <ul className="mt-6 flex flex-wrap gap-2" aria-label="Tonos sugeridos">
                      {result.tones.map((t) => (
                        <li key={t}>
                          <button
                            type="button"
                            onClick={() => tryTone(t)}
                            className="group flex h-11 items-center gap-2.5 rounded-full bg-graphite pl-1.5 pr-4 text-small text-text transition-shadow hover:ring-1 hover:ring-gold/60"
                            title={`Probarte ${t}`}
                          >
                            <span aria-hidden className="swatch size-8" style={{ background: tones[t] }} />
                            {t}
                            <span className="text-muted transition-colors group-hover:text-gold-light">Pruébatelo</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {result.notes.length ? (
                    <ul className="mt-6 space-y-2">
                      {result.notes.map((n) => (
                        <li key={n} className="flex gap-3 text-small text-muted">
                          <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold" />
                          {n}
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {works.length ? (
                    <ul className="mt-8 grid grid-cols-3 gap-2.5">
                      {works.map((w, n) => (
                        <motion.li
                          key={w.id}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15 + n * 0.08, duration: 0.5, ease }}
                          className="aspect-[3/4] overflow-hidden rounded-2xl bg-ink"
                        >
                          <Picture image={w} sizes="(min-width: 1024px) 16vw, 30vw" objectPosition="50% 30%" />
                        </motion.li>
                      ))}
                    </ul>
                  ) : null}

                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <CtaButton
                      size="lg"
                      onClick={() => {
                        track("Quiz → agenda", { resultado: result.title });
                        prefillBooking({ service: result.service, hair: a.hair, notes: summary(a, result) });
                      }}
                    >
                      Agendar mi diagnóstico
                    </CtaButton>
                    <button
                      type="button"
                      onClick={() => {
                        setA({});
                        go(0);
                      }}
                      className="text-small text-muted hover:text-gold-light"
                    >
                      Volver a empezar
                    </button>
                  </div>
                  <p className="mt-4 text-[0.8125rem] text-muted">Es una orientación: el plan final te lo da Diana al ver tu cabello.</p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
