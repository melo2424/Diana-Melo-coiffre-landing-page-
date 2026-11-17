import { byId } from "@/data/images";
import { Picture } from "@/components/ui/Picture";
import { Reveal } from "@/components/motion/Reveal";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Parallax } from "@/components/motion/Parallax";

/** Tres momentos de la cita, en diagonal descendente. */
export function Process() {
  return (
    <section id="tu-cita" aria-labelledby="cita-titulo" className="px-gutter pt-section">
      <div className="grid gap-y-14 md:grid-cols-12 md:gap-x-5 md:gap-y-0">
        {/* Primer momento */}
        <Reveal order={1} className="md:col-span-4 md:row-start-1">
          <div className="aspect-[3/4] overflow-hidden bg-onyx">
            <Picture
              image={byId("shooting/shooting-09-2024-05-14")}
              sizes="(min-width: 768px) 30vw, 92vw"
              objectPosition="50% 20%"
            />
          </div>
        </Reveal>

        <div className="md:col-span-6 md:col-start-7 md:row-start-1">
          <SplitReveal id="cita-titulo" lines={["Así es tu cita"]} className="text-title text-text" />
          <Reveal order={2} className="mt-10 md:mt-14">
            <p className="max-w-[36ch] text-body text-text">
              <strong className="font-medium text-text">Antes de venir,</strong> le escribes a Diana con una
              foto de tu cabello a la luz del día y otra del color que sueñas. Te dice qué es posible, en cuántas
              sesiones y cuánto cuesta.
            </p>
          </Reveal>
        </div>

        {/* Segundo momento: cuadrado, más abajo */}
        <div className="grid gap-6 md:col-span-7 md:col-start-6 md:row-start-1 md:mt-[max(26rem,34vw)] md:self-start md:grid-cols-7 md:gap-x-5">
          <Reveal order={1} className="ml-auto w-[62%] md:col-span-3 md:ml-0 md:w-full">
            <Parallax distance={50}>
              <div className="aspect-square overflow-hidden bg-onyx">
                <Picture
                  image={byId("olaplex/2025-03-28-dhwhf-wudiz")}
                  sizes="(min-width: 768px) 22vw, 62vw"
                  objectPosition="50% 50%"
                />
              </div>
            </Parallax>
          </Reveal>
          <Reveal order={2} className="md:col-span-4">
            <p className="max-w-[36ch] text-body text-text">
              <strong className="font-medium text-text">El día del color,</strong> el diagnóstico se hace frente
              al espejo. Durante la decoloración, Olaplex N.º1 y N.º2 protegen los enlaces del cabello, y el matiz del
              final fija el tono con su nombre.
            </p>
          </Reveal>
        </div>

        {/* Tercer momento: horizontal, aún más abajo, texto a la izquierda */}
        <div className="grid gap-6 md:col-span-12 md:row-start-2 md:mt-[7.5rem] md:grid-cols-12 md:gap-x-5">
          <Reveal order={2} className="order-2 md:order-1 md:col-span-4 md:col-start-3 md:self-start">
            <p className="max-w-[36ch] text-body text-text">
              <strong className="font-medium text-text">En casa,</strong> te llevas la rutina escrita: qué champú
              y qué acondicionador van con tu tono, y cada cuánto volver por el matiz para que no se apague.
            </p>
          </Reveal>
          <Reveal order={1} className="order-1 w-[78%] md:order-2 md:col-span-5 md:col-start-8 md:w-full">
            <div className="aspect-[16/10] overflow-hidden bg-onyx">
              <Picture
                image={byId("olaplex/2026-07-13-datxwxtjrqu-1")}
                sizes="(min-width: 768px) 40vw, 78vw"
                objectPosition="50% 60%"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
