import { byId } from "@/data/images";
import { site } from "@/data/site";
import { Picture } from "@/components/ui/Picture";
import { Reveal } from "@/components/motion/Reveal";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Parallax } from "@/components/motion/Parallax";

const facts = [
  ["Especialidad", "Colorimetría"],
  ["Estudio", site.city],
  ["Pasarela", "Cluster Moda Orinoquía"],
  ["Instagram", site.instagram.handle],
] as const;

export function About() {
  return (
    <section id="diana" aria-labelledby="diana-titulo" className="px-gutter pt-section">
      <div className="grid md:grid-cols-12 md:gap-x-5">
        <SplitReveal id="diana-titulo" lines={["Diana, de cerca"]} className="text-title text-text md:col-span-8" />
        <Reveal order={1} className="mt-6 md:col-span-6 md:mt-8">
          <p className="text-statement text-text">
            Colorista y estilista. Su trabajo va del sillón del estudio a las pasarelas y ferias de belleza de la región.
          </p>
        </Reveal>
      </div>

      <div className="mt-16 grid grid-cols-2 gap-4 md:mt-[4.5rem] md:grid-cols-12 md:gap-x-4">
        <Reveal order={2} className="relative col-span-2 md:col-span-4">
          <div className="aspect-[3/4] overflow-hidden bg-onyx">
            <Picture
              image={byId("trabajos/2026-10-04-degg4-rjff7")}
              sizes="(min-width: 768px) 30vw, 92vw"
              objectPosition="50% 25%"
            />
          </div>
          <p className="mt-3 text-small text-muted">Cluster Moda Orinoquía, con los diseñadores de la región.</p>
        </Reveal>

        <Reveal order={3} className="col-span-1 md:col-span-4 md:mt-[18vh]">
          <Parallax distance={50}>
            <div className="aspect-[3/4] overflow-hidden bg-onyx">
              <Picture
                image={byId("trabajos/2026-08-29-dcopqbwxmje")}
                sizes="(min-width: 768px) 30vw, 46vw"
                objectPosition="50% 30%"
              />
            </div>
            <p className="mt-3 text-small text-muted">Alfombra roja del Cluster.</p>
          </Parallax>
        </Reveal>

        <Reveal order={4} className="col-span-1 md:col-span-4">
          {/* El monograma de las batas del estudio, en el dorado de su bordado */}
          <div className="flex aspect-[3/4] items-end bg-gold p-5 md:aspect-auto md:h-[60%] md:min-h-[22rem] md:p-8">
            <p
              aria-hidden
              className="font-display text-[clamp(4.75rem,13vw,15rem)] leading-[0.8] tracking-[-0.04em] text-ink [font-variation-settings:'opsz'_96]"
            >
              DM
            </p>
          </div>
          <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 text-small lg:grid-cols-2">
            {facts.map(([k, v]) => (
              <div key={k}>
                <dt className="text-muted">{k}</dt>
                <dd className="text-text">{v}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
