import { byId } from "@/data/images";
import { bookingChannel, bookingHref, site } from "@/data/site";
import { Picture } from "@/components/ui/Picture";
import { Reveal } from "@/components/motion/Reveal";
import { SplitReveal } from "@/components/motion/SplitReveal";

/** Cierre: una frase, un retrato pequeño (lo único iluminado de la fila) y dos enlaces. */
export function Contact() {
  return (
    <section id="agendar" aria-labelledby="agendar-titulo" className="px-gutter pb-[7.5rem] pt-section">
      <div className="grid gap-y-12 md:grid-cols-12 md:gap-x-5">
        <div className="md:col-span-6">
          <SplitReveal id="agendar-titulo" lines={["Agenda tu cita"]} className="text-title text-text" />
          <Reveal order={1}>
            <p className="mt-8 max-w-[30ch] text-statement text-text">
              Cuéntale qué color tienes hoy y cuál quieres. Diana te responde con un plan.
            </p>
          </Reveal>
        </div>

        <div className="flex gap-6 md:col-span-6 md:col-start-7 md:gap-8 lg:col-span-5 lg:col-start-8">
          <Reveal order={2} className="shrink-0">
            <div className="size-24 overflow-hidden bg-onyx md:size-40">
              <Picture
                image={byId("shooting/shooting-03-2023-12-04-video-cover")}
                sizes="160px"
                objectPosition="50% 25%"
              />
            </div>
          </Reveal>
          <Reveal order={3} className="min-w-0">
            <p className="text-body font-medium text-text">¿Lista para tu color?</p>
            <ul className="mt-5 space-y-3 text-body">
              <li>
                <a
                  href={bookingHref}
                  target="_blank"
                  rel="noopener"
                  className="group inline-flex h-12 items-center gap-3 bg-accent px-6 font-medium text-on-accent transition-colors hover:bg-gold-light active:translate-y-px"
                >
                  Escribir por {bookingChannel}
                  <span aria-hidden className="transition-transform duration-[var(--dur-base)] group-hover:translate-x-1">
                    →
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={site.instagram.url}
                  target="_blank"
                  rel="noopener"
                  className="text-text underline decoration-gold/70 decoration-2 underline-offset-[7px] transition-colors hover:text-gold-light hover:decoration-gold"
                >
                  Ver más en Instagram
                </a>
              </li>
            </ul>
            <p className="mt-6 text-small text-muted">{site.city}. Solo con cita previa.</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
