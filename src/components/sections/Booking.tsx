"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { bookingLink, site } from "@/data/site";
import { agenda, hairStates, services } from "@/lib/agenda/config";
import { addToCalendarLink, confirmationMessage, formatDay, formatTime, period, type Booking as Data } from "@/lib/agenda/format";
import type { Day } from "@/lib/agenda/slots";
import { Cta, CtaButton } from "@/components/ui/Cta";
import { WhatsAppIcon } from "@/components/layout/WhatsAppButton";
import { careFor, serviceFamily } from "@/data/care";
import { useShared } from "@/lib/store";
import { track } from "@/lib/track";
import { Waitlist } from "./Waitlist";
import { PhotoPicker, type Photos } from "./PhotoPicker";

const ease = [0.22, 1, 0.36, 1] as const;
type Step = 0 | 1 | 2;
type Errors = Partial<Record<"name" | "phone" | "email" | "service" | "hair" | "consent" | "start" | "photos", string>>;

const weekday = new Intl.DateTimeFormat("es-CO", { timeZone: agenda.timeZone, weekday: "short" });
const dayNum = new Intl.DateTimeFormat("es-CO", { timeZone: agenda.timeZone, day: "numeric" });
const month = new Intl.DateTimeFormat("es-CO", { timeZone: agenda.timeZone, month: "short" });
const noon = (date: string) => new Date(`${date}T12:00:00${agenda.offset}`);

/**
 * Agenda de diagnóstico en tres pasos: día y hora → tus datos → listo.
 * La cita queda en el Google Calendar de Diana y la clienta le escribe por WhatsApp con todo ya escrito.
 */
export function Booking() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState<Step>(0);
  const [days, setDays] = useState<Day[] | null>(null);
  const [mode, setMode] = useState<"calendar" | "solicitud">("solicitud");
  const [loadError, setLoadError] = useState("");
  const [date, setDate] = useState<string | null>(null);
  const [start, setStart] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", service: "", hair: "", notes: "", empresa: "" });
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ calendar: boolean; end: string; photos?: boolean } | null>(null);
  const [failMsg, setFailMsg] = useState("");
  const [photosOn, setPhotosOn] = useState(false);
  const [photos, setPhotos] = useState<Photos>({});
  const [waitlist, setWaitlist] = useState(false);

  // El quiz llena la agenda: se aplica una vez por envío (nonce), sin efectos.
  const prefill = useShared((s) => s.prefill);
  const [seen, setSeen] = useState(0);
  if (prefill && prefill.nonce !== seen) {
    setSeen(prefill.nonce);
    setForm((f) => ({
      ...f,
      service: prefill.service ?? f.service,
      hair: prefill.hair ?? f.hair,
      notes: prefill.notes ?? f.notes,
    }));
  }

  // Solo actualiza el estado cuando llega la respuesta (nada síncrono dentro del efecto).
  const fetchAgenda = () => {
    fetch("/api/agenda", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j: { mode: "calendar" | "solicitud"; photos: boolean; days: Day[] }) => {
        setMode(j.mode);
        setPhotosOn(j.photos);
        setDays(j.days);
        setDate((d) => d ?? j.days.find((x) => x.slots.length)?.date ?? null);
      })
      .catch(() => setLoadError("No pudimos cargar la agenda."));
  };
  useEffect(fetchAgenda, []);
  const load = () => {
    setLoadError("");
    fetchAgenda();
  };

  const slots = useMemo(() => days?.find((d) => d.date === date)?.slots ?? [], [days, date]);
  const set = (k: keyof typeof form) => (v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const data: Data | null = start
    ? { start, name: form.name.trim(), phone: form.phone, email: form.email.trim() || undefined, service: form.service, hair: form.hair, notes: form.notes.trim() || undefined }
    : null;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!data) return setStep(0);
    const local: Errors = {};
    if (data.name.length < 2) local.name = "Escribe tu nombre.";
    if (form.phone.replace(/\D/g, "").length < 10) local.phone = "Escribe tu celular de 10 dígitos.";
    if (!data.service) local.service = "Elige qué te quieres hacer.";
    if (!data.hair) local.hair = "Cuéntanos cómo está tu cabello.";
    if (!consent) local.consent = "Necesitamos tu autorización para agendar.";
    if (Object.keys(local).length) return setErrors(local);

    setSending(true);
    setFailMsg("");
    try {
      const fd = new FormData();
      Object.entries({ ...data, empresa: form.empresa }).forEach(([k, v]) => v && fd.append(k, v));
      fd.append("consent", String(consent));
      if (photos.actual) fd.append("foto_actual", photos.actual);
      if (photos.referencia) fd.append("foto_referencia", photos.referencia);
      const res = await fetch("/api/agenda", { method: "POST", body: fd });
      const j = await res.json();
      if (res.ok) {
        setResult({ calendar: j.calendar, end: j.end, photos: !!j.photos });
        setStep(2);
        track("Reserva", { modo: j.calendar ? "calendar" : "solicitud", servicio: data.service, fotos: !!j.photos });
      } else if (j.errors) {
        setErrors(j.errors);
        if (j.errors.start) {
          setStart(null);
          setStep(0);
          load();
        }
      } else {
        setFailMsg(j.error ?? "Algo salió mal.");
        if (j.fallback) setResult({ calendar: false, end: start! });
      }
    } catch {
      setFailMsg("Sin conexión. Intenta de nuevo o escríbenos por WhatsApp.");
    } finally {
      setSending(false);
    }
  }

  const slide = {
    initial: reduce ? { opacity: 0 } : { opacity: 0, x: 40 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.5, ease } },
    exit: reduce ? { opacity: 0 } : { opacity: 0, x: -40, transition: { duration: 0.25 } },
  };

  return (
    <div className="relative overflow-hidden rounded-[1.75rem] bg-onyx p-5 ring-1 ring-white/5 sm:p-8">
      <Steps step={step} />

      <AnimatePresence mode="wait" initial={false}>
        {/* ------------------------------------------------ 1. día y hora */}
        {step === 0 ? (
          <motion.div key="cuando" {...slide} className="mt-8">
            <p className="font-display text-[1.625rem] leading-tight text-text">¿Qué día te queda bien?</p>
            <p className="mt-1 text-small text-muted">
              Diagnóstico de {agenda.duration} minutos · hora de Colombia
            </p>

            {loadError ? (
              <div className="mt-6 flex flex-wrap items-center gap-4 text-body text-text">
                {loadError}
                <button type="button" onClick={load} className="round-btn !w-auto px-5 text-small">
                  Reintentar
                </button>
              </div>
            ) : !days ? (
              <div aria-busy className="mt-6 flex gap-2.5 overflow-hidden">
                {Array.from({ length: 7 }, (_, i) => (
                  <div key={i} className="h-[5.5rem] w-[4.25rem] shrink-0 animate-pulse rounded-2xl bg-graphite/60" />
                ))}
              </div>
            ) : (
              <>
                <ul
                  aria-label="Días disponibles"
                  className="-mx-5 mt-6 flex snap-x scroll-px-5 gap-2.5 overflow-x-auto px-5 pb-2 sm:scroll-px-8 [scrollbar-width:none] sm:-mx-8 sm:px-8 [&::-webkit-scrollbar]:hidden"
                >
                  {days.map((d) => {
                    const free = d.slots.length > 0;
                    const active = d.date === date;
                    return (
                      <li key={d.date} className="snap-start">
                        <button
                          type="button"
                          disabled={!free}
                          aria-pressed={active}
                          onClick={() => {
                            setDate(d.date);
                            setStart(null);
                            track("Agenda día");
                          }}
                          className={`relative flex h-[5.5rem] w-[4.25rem] flex-col items-center justify-center rounded-2xl transition-colors duration-300 disabled:opacity-30 ${
                            active ? "text-ink" : "bg-ink text-text ring-1 ring-graphite hover:ring-gold/50"
                          }`}
                        >
                          {active ? (
                            <motion.span
                              layoutId="day-pill"
                              className="absolute inset-0 rounded-2xl bg-gold"
                              transition={{ duration: reduce ? 0 : 0.45, ease }}
                            />
                          ) : null}
                          <span className="relative text-[0.75rem] capitalize opacity-75">
                            {weekday.format(noon(d.date)).replace(".", "")}
                          </span>
                          <span className="relative font-display text-[1.75rem] leading-none">
                            {dayNum.format(noon(d.date))}
                          </span>
                          <span className="relative text-[0.75rem] opacity-75">{month.format(noon(d.date)).replace(".", "")}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>

                {errors.start ? <p className="mt-4 text-small text-[#f0a29a]">{errors.start}</p> : null}

                <p className="mt-7 text-small text-muted first-letter:uppercase">{date ? formatDay(noon(date).toISOString()) : ""}</p>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.ul
                    key={date}
                    aria-label="Horas disponibles"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: reduce ? 0 : 0.3, ease }}
                    className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4"
                  >
                    {slots.length ? (
                      slots.map((s) => (
                        <li key={s}>
                          <button
                            type="button"
                            aria-pressed={start === s}
                            onClick={() => setStart(s)}
                            className={`h-11 w-full rounded-full text-[0.9375rem] transition-[background-color,color,box-shadow] duration-300 ${
                              start === s
                                ? "bg-gold text-ink shadow-[0_10px_24px_-12px_rgb(198_161_91/0.9)]"
                                : "text-text ring-1 ring-graphite hover:ring-gold/60"
                            }`}
                          >
                            {formatTime(s)}
                          </button>
                        </li>
                      ))
                    ) : (
                      <li className="col-span-full text-body text-muted">No quedan horas este día. Prueba otro.</li>
                    )}
                  </motion.ul>
                </AnimatePresence>

                <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setWaitlist((v) => !v)}
                    aria-expanded={waitlist}
                    className="text-small text-muted underline-offset-4 hover:text-gold-light hover:underline"
                  >
                    ¿Ninguna hora te sirve? Avísame si se libera un turno
                  </button>
                  <CtaButton disabled={!start} onClick={() => setStep(1)}>
                    Continuar
                  </CtaButton>
                </div>
                <AnimatePresence initial={false}>
                  {waitlist ? <Waitlist key="espera" onClose={() => setWaitlist(false)} /> : null}
                </AnimatePresence>
              </>
            )}
          </motion.div>
        ) : null}

        {/* ------------------------------------------------ 2. tus datos */}
        {step === 1 && start ? (
          <motion.form key="datos" {...slide} onSubmit={submit} noValidate className="mt-8">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-ink px-4 py-3 ring-1 ring-graphite">
              <p className="text-body text-text first-letter:uppercase">
                {formatDay(start)} · <span className="text-gold-light">{formatTime(start)}</span>
              </p>
              <button type="button" onClick={() => setStep(0)} className="text-small text-muted hover:text-gold-light">
                Cambiar
              </button>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field label="Tu nombre" error={errors.name}>
                <input
                  value={form.name}
                  onChange={(e) => set("name")(e.target.value)}
                  autoComplete="name"
                  className={input(errors.name)}
                />
              </Field>
              <Field label="Tu WhatsApp" error={errors.phone}>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">+57</span>
                  <input
                    value={form.phone}
                    onChange={(e) => set("phone")(e.target.value)}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    placeholder="300 123 4567"
                    className={`${input(errors.phone)} pl-12`}
                  />
                </div>
              </Field>
              <Field label="Correo (opcional)" error={errors.email} className="sm:col-span-2">
                <input
                  value={form.email}
                  onChange={(e) => set("email")(e.target.value)}
                  type="email"
                  autoComplete="email"
                  className={input(errors.email)}
                />
              </Field>
            </div>

            <Chips label="¿Qué te quieres hacer?" options={services} value={form.service} onChange={set("service")} error={errors.service} />
            <Chips label="¿Cómo está tu cabello hoy?" options={hairStates} value={form.hair} onChange={set("hair")} error={errors.hair} />

            {photosOn ? (
              <PhotoPicker value={photos} onChange={setPhotos} error={errors.photos} />
            ) : (
              <p className="mt-6 text-small text-muted">¿Tienes fotos de tu cabello o de un color que te guste? Al final se las mandas a Diana por WhatsApp.</p>
            )}

            <Field label="Cuéntame más (opcional)" className="mt-6">
              <textarea
                value={form.notes}
                onChange={(e) => set("notes")(e.target.value)}
                rows={3}
                maxLength={600}
                placeholder="Qué color tienes, qué te has hecho antes, una foto de referencia que te guste…"
                className={`${input()} h-auto resize-none py-3`}
              />
            </Field>

            {/* campo trampa para bots */}
            <input
              aria-hidden
              tabIndex={-1}
              autoComplete="off"
              value={form.empresa}
              onChange={(e) => set("empresa")(e.target.value)}
              className="absolute -left-[9999px] h-0 w-0 opacity-0"
              name="empresa"
            />

            <label className="mt-6 flex cursor-pointer items-start gap-3 text-small text-muted">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => {
                  setConsent(e.target.checked);
                  setErrors((x) => ({ ...x, consent: undefined }));
                }}
                className="peer sr-only"
              />
              <span
                aria-hidden
                className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ring-1 ring-gold/60 transition-colors peer-checked:bg-gold peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold"
              >
                <svg viewBox="0 0 16 16" className={`size-3 text-ink transition-opacity ${consent ? "opacity-100" : "opacity-0"}`} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3.5 8.5 3 3 6-7" />
                </svg>
              </span>
              <span>
                Autorizo a {site.name} a usar mis datos solo para gestionar mi cita y escribirme por WhatsApp, según la Ley 1581
                de 2012.
              </span>
            </label>
            {errors.consent ? <p className="mt-2 text-small text-[#f0a29a]">{errors.consent}</p> : null}

            {failMsg ? (
              <div className="mt-6 rounded-2xl bg-ink p-4 text-small text-text ring-1 ring-[#f0a29a]/40">
                {failMsg}
                {result && data ? (
                  <div className="mt-3">
                    <Cta href={bookingLink(confirmationMessage(data, false))} icon={<WhatsAppIcon />}>
                      Enviar por WhatsApp
                    </Cta>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <button type="button" onClick={() => setStep(0)} className="text-small text-muted hover:text-gold-light">
                ← Volver
              </button>
              <CtaButton type="submit" size="lg" disabled={sending}>
                {sending ? "Agendando…" : mode === "calendar" ? "Agendar diagnóstico" : "Pedir mi cita"}
              </CtaButton>
            </div>
          </motion.form>
        ) : null}

        {/* ------------------------------------------------ 3. listo */}
        {step === 2 && data && result ? (
          <motion.div key="listo" {...slide} className="mt-8 text-center">
            <Check />
            <p className="mt-6 font-display text-[2rem] leading-tight text-text">
              {result.calendar ? `¡Listo, ${data.name.split(" ")[0]}!` : `Casi listo, ${data.name.split(" ")[0]}`}
            </p>
            <p className="mx-auto mt-3 max-w-[38ch] text-body text-text">
              {result.calendar ? (
                <>
                  Tu diagnóstico quedó en la agenda de Diana para el{" "}
                  <span className="text-gold-light">
                    {formatDay(data.start)} a las {period(formatTime(data.start))}
                  </span>{" "}
                  Envíale tu confirmación por WhatsApp para que tenga tus datos a mano.
                </>
              ) : (
                <>
                  Envía tu solicitud por WhatsApp para el{" "}
                  <span className="text-gold-light">
                    {formatDay(data.start)} a las {period(formatTime(data.start))}
                  </span>{" "}
                  Diana te confirma por ahí.
                </>
              )}
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Cta
                href={bookingLink(confirmationMessage(data, result.calendar))}
                size="lg"
                icon={<WhatsAppIcon />}
                onClick={() => track("WhatsApp confirmar", { modo: result.calendar ? "calendar" : "solicitud" })}
              >
                {result.calendar ? "Confirmar por WhatsApp" : "Enviar por WhatsApp"}
              </Cta>
              {result.calendar ? (
                <Cta href={addToCalendarLink(data, result.end, site.city)} variant="ghost" size="lg">
                  Guardar en mi calendario
                </Cta>
              ) : null}
            </div>
            {(() => {
              const c = careFor(serviceFamily[data.service] ?? "");
              return c ? (
                <p className="mt-8 text-small text-muted">
                  Mientras llega el día:{" "}
                  <a href={`/cuidado/${c.family}`} className="text-gold-light underline underline-offset-4">
                    {c.title.toLowerCase()}
                  </a>
                  .
                </p>
              ) : null;
            })()}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/* ---------------------------------------------------------------- piezas */

const input = (error?: string) =>
  `h-12 w-full rounded-2xl bg-ink px-4 text-body text-text placeholder:text-stone/70 outline-none ring-1 transition-shadow duration-300 focus:ring-2 focus:ring-gold ${
    error ? "ring-[#f0a29a]/70" : "ring-graphite"
  }`;

function Field({ label, error, className = "", children }: { label: string; error?: string; className?: string; children: ReactNode }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-small text-muted">{label}</span>
      {children}
      {error ? <span className="mt-1.5 block text-small text-[#f0a29a]">{error}</span> : null}
    </label>
  );
}

function Chips({
  label,
  options,
  value,
  onChange,
  error,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <fieldset className="mt-6">
      <legend className="mb-3 text-small text-muted">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            aria-pressed={value === o}
            onClick={() => onChange(o)}
            className={`h-10 rounded-full px-4 text-[0.9375rem] transition-[background-color,color,box-shadow] duration-300 ${
              value === o ? "bg-gold text-ink" : "text-text ring-1 ring-graphite hover:ring-gold/60"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
      {error ? <p className="mt-2 text-small text-[#f0a29a]">{error}</p> : null}
    </fieldset>
  );
}

function Steps({ step }: { step: Step }) {
  const labels = ["Día y hora", "Tus datos", "Listo"];
  return (
    <ol className="flex items-center gap-2 text-small" aria-label="Pasos">
      {labels.map((l, i) => (
        <li key={l} className="flex items-center gap-2" aria-current={i === step ? "step" : undefined}>
          <span
            className={`grid size-7 place-items-center rounded-full text-[0.8125rem] transition-colors duration-500 ${
              i < step ? "bg-gold/25 text-gold-light" : i === step ? "bg-gold text-ink" : "text-muted ring-1 ring-graphite"
            }`}
          >
            {i < step ? "✓" : i + 1}
          </span>
          <span className={`hidden sm:inline ${i === step ? "text-text" : "text-muted"}`}>{l}</span>
          {i < labels.length - 1 ? <span aria-hidden className="mx-1 h-px w-6 bg-graphite sm:w-10" /> : null}
        </li>
      ))}
    </ol>
  );
}

function Check() {
  const reduce = useReducedMotion();
  return (
    <svg viewBox="0 0 80 80" className="mx-auto size-20" aria-hidden>
      <motion.circle
        cx="40"
        cy="40"
        r="36"
        fill="none"
        stroke="var(--gold)"
        strokeWidth="2"
        initial={reduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, ease }}
      />
      <motion.path
        d="m25 41 10 10 20-22"
        fill="none"
        stroke="var(--gold-light)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, delay: 0.6, ease }}
      />
    </svg>
  );
}
