import { portfolio } from "@/data/images";
import { ColorLab } from "./ColorLab";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Reveal } from "@/components/motion/Reveal";

/**
 * Trabajos: una sola galería. La rueda de tonos es el filtro; debajo, las fotos ordenadas
 * por lo que se eligió (sin tono elegido se ven todas).
 */
export function Work() {
  return (
    <section id="trabajos" aria-labelledby="trabajos-titulo" className="px-gutter pt-section">
      <div className="grid gap-y-8 md:grid-cols-12 md:gap-x-5">
        <SplitReveal id="trabajos-titulo" lines={["Trabajos"]} className="text-title text-text md:col-span-6" />
        <Reveal order={1} className="md:col-span-5 md:col-start-8 md:self-end">
          <p className="max-w-[40ch] text-body text-text">
            {portfolio.length} colores reales que salieron del estudio. Elige tonos en la rueda y mira cómo se ven en
            cabello de verdad.
          </p>
        </Reveal>
      </div>

      <ColorLab />
    </section>
  );
}
