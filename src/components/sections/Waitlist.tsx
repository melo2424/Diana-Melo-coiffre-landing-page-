"use client";

import { motion } from "framer-motion";
import { useState, type FormEvent } from "react";
import { bookingLink } from "@/data/site";
import { CtaButton, Cta } from "@/components/ui/Cta";
import { WhatsAppIcon } from "@/components/layout/WhatsAppButton";
import { track } from "@/lib/track";

/** «Avísame si se libera un turno»: queda en la lista de espera del panel de Diana. */
export function Waitlist({ onClose }: { onClose: () => void }) {
  const [f, setF] = useState({ name: "", phone: "", when: "", empresa: "" });
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "done" | "fallback">("idle");
  const [error, setError] = useState("");

  const msg = `Hola Diana, soy ${f.name || "…"}. No encontré hora en tu agenda: ¿me avisas si se libera un turno?${f.when ? ` Me sirve: ${f.when}.` : ""}`;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (f.name.trim().length < 2 || f.phone.replace(/\D/g, "").length < 10) return setError("Escribe tu nombre y tu celular de 10 dígitos.");
    if (!consent) return setError("Necesitamos tu autorización para escribirte.");
    setState("sending");
    try {
      const res = await fetch("/api/agenda/espera", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, consent }),
      });
      const j = await res.json();
      if (res.ok && j.calendar) {
        setState("done");
        track("Lista de espera");
      } else if (res.ok || j.fallback) setState("fallback");
      else {
        setError(Object.values(j.errors ?? {})[0] as string ?? j.error ?? "Algo salió mal.");
        setState("idle");
      }
    } catch {
      setState("fallback");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden"
    >
      <div className="mt-6 rounded-2xl bg-ink p-5 ring-1 ring-graphite">
        {state === "done" ? (
          <p className="text-body text-text">
            Listo, quedaste en la lista de espera. Si se libera un turno, Diana te escribe por WhatsApp.
          </p>
        ) : state === "fallback" ? (
          <div>
            <p className="text-body text-text">Envíale tu solicitud a Diana por WhatsApp y ella te avisa:</p>
            <Cta href={bookingLink(msg)} icon={<WhatsAppIcon />} className="mt-4">
              Enviar por WhatsApp
            </Cta>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <p className="font-display text-[1.25rem] text-text">Te aviso si se libera un turno</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input
                placeholder="Tu nombre"
                value={f.name}
                autoComplete="name"
                onChange={(e) => setF({ ...f, name: e.target.value })}
                className="h-11 rounded-2xl bg-onyx px-4 text-body text-text outline-none ring-1 ring-graphite placeholder:text-stone/70 focus:ring-2 focus:ring-gold"
              />
              <input
                placeholder="Tu WhatsApp"
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                value={f.phone}
                onChange={(e) => setF({ ...f, phone: e.target.value })}
                className="h-11 rounded-2xl bg-onyx px-4 text-body text-text outline-none ring-1 ring-graphite placeholder:text-stone/70 focus:ring-2 focus:ring-gold"
              />
              <input
                placeholder="¿Qué días u horas te sirven? (opcional)"
                value={f.when}
                onChange={(e) => setF({ ...f, when: e.target.value })}
                className="h-11 rounded-2xl bg-onyx px-4 text-body text-text outline-none ring-1 ring-graphite placeholder:text-stone/70 focus:ring-2 focus:ring-gold sm:col-span-2"
              />
              <input aria-hidden tabIndex={-1} autoComplete="off" value={f.empresa} onChange={(e) => setF({ ...f, empresa: e.target.value })} className="absolute -left-[9999px] h-0 w-0 opacity-0" />
            </div>
            <label className="mt-4 flex items-start gap-3 text-small text-muted">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 accent-[var(--gold)]" />
              Autorizo que me escriban por WhatsApp para avisarme de un turno (Ley 1581 de 2012).
            </label>
            {error ? <p className="mt-2 text-small text-[#f0a29a]">{error}</p> : null}
            <div className="mt-5 flex flex-wrap items-center gap-4">
              <CtaButton type="submit" disabled={state === "sending"}>
                {state === "sending" ? "Guardando…" : "Avísame"}
              </CtaButton>
              <button type="button" onClick={onClose} className="text-small text-muted hover:text-gold-light">
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </motion.div>
  );
}
