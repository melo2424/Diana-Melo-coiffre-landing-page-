"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { byId, tones } from "@/data/images";
import { bookingLink } from "@/data/site";
import { hairMask, paint, toCanvas } from "@/lib/tint";
import { prefillBooking, useShared } from "@/lib/store";
import { track } from "@/lib/track";
import { Compare } from "@/components/ui/Compare";
import { Cta, CtaButton } from "@/components/ui/Cta";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Reveal } from "@/components/motion/Reveal";
import { WhatsAppIcon } from "@/components/layout/WhatsAppButton";

const SAMPLE = byId("shooting/shooting-09-2024-05-14");
const TONES = Object.keys(tones);

/** "Miel+Dorado" → color promedio de la mezcla. */
function toneHex(name: string) {
  const list = name.split("+").filter((t) => tones[t]);
  if (!list.length) return tones.Miel;
  const rgb = list
    .map((t) => [1, 3, 5].map((i) => parseInt(tones[t].slice(i, i + 2), 16)))
    .reduce((a, c) => a.map((v, i) => v + c[i] / list.length), [0, 0, 0]);
  return `#${rgb.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
}

type Photo = { canvas: HTMLCanvasElement; before: string; mask: Float32Array; sample: boolean };

/** Pruébate el color: tu foto, tu cabello detectado y el tono encima. Nada sale del teléfono. */
export function TryOn() {
  const [tone, setTone] = useState("Miel");
  const [strength, setStrength] = useState(0.85);
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [after, setAfter] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // La rueda y el quiz eligen el tono desde fuera.
  const incoming = useShared((s) => s.tryTone);
  const [seen, setSeen] = useState(0);
  if (incoming && incoming.nonce !== seen) {
    setSeen(incoming.nonce);
    setTone(incoming.tone);
  }

  // Repintar al cambiar tono o intensidad (el pintado es local y rápido).
  useEffect(() => {
    if (!photo) return;
    const id = requestAnimationFrame(() => setAfter(paint(photo.canvas, photo.mask, toneHex(tone), strength).toDataURL("image/jpeg", 0.9)));
    return () => cancelAnimationFrame(id);
  }, [photo, tone, strength]);

  async function use(source: Blob | string, sample = false) {
    setState("loading");
    setError("");
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = typeof source === "string" ? source : URL.createObjectURL(source);
      await img.decode();
      const canvas = toCanvas(img);
      const mask = await hairMask(canvas);
      if (!mask.some((v) => v > 0.6)) throw new Error("sin-cabello");
      setPhoto({ canvas, before: canvas.toDataURL("image/jpeg", 0.9), mask, sample });
      setState("idle");
      track("Probador", { foto: sample ? "ejemplo" : "propia" });
    } catch (e) {
      setState("error");
      setError(
        (e as Error).message === "sin-cabello"
          ? "No encontré cabello en la foto. Prueba con una donde se vea bien tu pelo, con buena luz."
          : "No pude cargar el probador. Revisa tu conexión e inténtalo de nuevo.",
      );
    }
  }

  const ratio = photo ? `${photo.canvas.width} / ${photo.canvas.height}` : "4 / 5";

  return (
    <section id="probador" aria-labelledby="probador-titulo" className="px-gutter pt-section">
      <div className="grid gap-y-10 lg:grid-cols-12 lg:gap-x-10">
        <div className="lg:col-span-5">
          <SplitReveal id="probador-titulo" lines={["Pruébate", "el color"]} className="text-title text-text" />
          <Reveal order={1}>
            <p className="mt-6 max-w-[36ch] text-body text-text">
              Sube una selfie y mira cómo te vería cada tono. Tu foto se procesa en tu teléfono: no se sube a ningún lado.
            </p>
          </Reveal>

          <Reveal order={2}>
            <p className="mt-10 text-small text-muted">Tono</p>
            <ul className="mt-3 flex flex-wrap gap-2" aria-label="Tonos para probar">
              {TONES.map((t) => {
                const on = tone === t;
                return (
                  <li key={t}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => setTone(t)}
                      className={`flex h-10 items-center gap-2 rounded-full pl-1 pr-3.5 text-small transition-[background-color,color,box-shadow] duration-300 ${
                        on ? "bg-gold text-ink" : "text-text ring-1 ring-graphite hover:ring-gold/60"
                      }`}
                    >
                      <span aria-hidden className="swatch size-8" style={{ background: tones[t] }} />
                      {t}
                    </button>
                  </li>
                );
              })}
            </ul>
            {tone.includes("+") ? <p className="mt-3 text-small text-gold-light">Tu mezcla: {tone.replace(/\+/g, " + ")}</p> : null}

            <label className="mt-8 block max-w-sm">
              <span className="flex justify-between text-small text-muted">
                Intensidad <span className="tabular text-text">{Math.round(strength * 100)} %</span>
              </span>
              <input
                type="range"
                min={0.3}
                max={1}
                step={0.05}
                value={strength}
                onChange={(e) => setStrength(Number(e.target.value))}
                className="mt-3 w-full accent-[var(--gold)]"
              />
            </label>
          </Reveal>
        </div>

        <Reveal order={2} className="min-w-0 lg:col-span-7">
          <div className="rounded-[1.75rem] bg-onyx p-4 ring-1 ring-white/5 sm:p-6">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="user"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (f) use(f);
              }}
            />

            <AnimatePresence mode="wait" initial={false}>
              {photo && after ? (
                <motion.div key="resultado" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                  <Compare
                    ratio={ratio}
                    labels={["Tu foto", tone.replace(/\+/g, " + ")]}
                    // eslint-disable-next-line @next/next/no-img-element
                    before={<img src={photo.before} alt="Tu foto original" draggable={false} />}
                    // eslint-disable-next-line @next/next/no-img-element
                    after={<img src={after} alt={`Tu foto con el cabello en tono ${tone}`} draggable={false} />}
                    className="mx-auto max-h-[70svh]"
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="vacío"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative grid aspect-[4/5] place-items-center overflow-hidden rounded-[1.25rem] bg-ink text-center sm:aspect-[5/4]"
                >
                  <div className="px-6">
                    {state === "loading" ? (
                      <>
                        <span className="mx-auto block size-12 animate-spin rounded-full border-2 border-gold border-t-transparent" />
                        <p className="mt-5 text-body text-text">Buscando tu cabello…</p>
                        <p className="mt-1 text-small text-muted">La primera vez tarda unos segundos.</p>
                      </>
                    ) : (
                      <>
                        <span className="mx-auto grid size-16 place-items-center rounded-full text-gold-light ring-1 ring-gold/45">
                          <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
                            <circle cx="12" cy="13" r="3.5" />
                          </svg>
                        </span>
                        <p className="mt-5 font-display text-[1.5rem] text-text">Tu selfie, con otro color</p>
                        <p className="mx-auto mt-2 max-w-[34ch] text-small text-muted">
                          Mejor de frente o de lado, con el cabello suelto y buena luz.
                        </p>
                        {error ? <p className="mx-auto mt-4 max-w-[36ch] text-small text-[#f0a29a]">{error}</p> : null}
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <CtaButton onClick={() => fileRef.current?.click()} disabled={state === "loading"}>
                {photo && !photo.sample ? "Cambiar foto" : "Subir mi foto"}
              </CtaButton>
              {!photo || photo.sample ? (
                <button
                  type="button"
                  disabled={state === "loading"}
                  onClick={() => use(SAMPLE.src, true)}
                  className="h-12 rounded-full px-5 text-small text-muted ring-1 ring-graphite transition-colors hover:text-text hover:ring-gold/50 disabled:opacity-40"
                >
                  Probar con una foto de ejemplo
                </button>
              ) : null}
              {photo && after ? (
                <a href={after} download={`mi-tono-${tone.toLowerCase().replace(/\+/g, "-")}.jpg`} className="text-small text-muted underline-offset-4 hover:text-gold-light hover:underline">
                  Guardar imagen
                </a>
              ) : null}
            </div>

            {photo && after ? (
              <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-white/5 pt-6">
                <p className="mr-auto text-body text-text">¿Te gustó?</p>
                <CtaButton onClick={() => prefillBooking({ notes: `Me probé el tono ${tone.replace(/\+/g, " + ")} en el probador de la web.` })}>
                  Agendar con este tono
                </CtaButton>
                <Cta href={bookingLink(`Hola Diana, me probé el tono ${tone.replace(/\+/g, " + ")} en tu web y me encantó. ¿Me queda?`)} variant="ghost" icon={<WhatsAppIcon />}>
                  Preguntarle a Diana
                </Cta>
              </div>
            ) : null}
            <p className="mt-4 text-[0.8125rem] text-muted">Es una simulación: el resultado real depende de tu cabello y lo define Diana en el diagnóstico.</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
