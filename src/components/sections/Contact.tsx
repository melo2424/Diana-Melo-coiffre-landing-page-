import { byId } from "@/data/images";
import { site } from "@/data/site";
import { agenda } from "@/lib/agenda/config";
import { Picture } from "@/components/ui/Picture";
import { Reveal } from "@/components/motion/Reveal";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Booking } from "./Booking";

const steps = [
  "Eliges día y hora; queda en la agenda de Diana.",
  "Le confirmas por WhatsApp con tus datos ya escritos.",
  `En ${agenda.duration} minutos mira tu cabello y te arma un plan de color.`,
];

/** Cierre: la agenda de diagnóstico, conectada al Google Calendar de Diana y a WhatsApp. */
export function Contact() {
  return (
    <section id="agendar" aria-labelledby="agendar-titulo" className="px-gutter pb-[7.5rem] pt-section">
      <div className="grid grid-cols-1 gap-y-12 lg:grid-cols-12 lg:gap-x-10">
        <div className="lg:col-span-5">
          <SplitReveal id="agendar-titulo" lines={["Agenda tu", "diagnóstico"]} className="text-title text-text" />
          <Reveal order={1}>
            <p className="mt-8 max-w-[30ch] text-statement text-text">
              Antes de cualquier color, una cita corta para conocer tu cabello.
            </p>
          </Reveal>
          <Reveal order={2}>
            <ol className="mt-10 space-y-5">
              {steps.map((s, i) => (
                <li key={s} className="flex gap-4 text-body text-text">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full font-display text-[1.05rem] text-gold-light ring-1 ring-gold/45">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{s}</span>
                </li>
              ))}
            </ol>
          </Reveal>
          <Reveal order={3}>
            <div className="mt-10 flex items-center gap-4">
              <div className="size-16 shrink-0 overflow-hidden rounded-full ring-1 ring-gold/40 ring-offset-4 ring-offset-ink">
                <Picture image={byId("shooting/shooting-03-2023-12-04-video-cover")} sizes="64px" objectPosition="50% 25%" />
              </div>
              <p className="text-small text-muted">
                {site.city}. Solo con cita previa.
                <br />
                ¿Dudas? Escríbeme al WhatsApp del botón dorado.
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal order={2} className="min-w-0 lg:col-span-7">
          <Booking />
        </Reveal>
      </div>
    </section>
  );
}
