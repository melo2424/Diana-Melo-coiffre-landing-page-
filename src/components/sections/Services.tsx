import { byId } from "@/data/images";
import { bookingLink } from "@/data/site";
import { Picture } from "@/components/ui/Picture";
import { Reveal } from "@/components/motion/Reveal";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Parallax } from "@/components/motion/Parallax";

const groups = [
  {
    name: "Color",
    items: [
      ["Balayage", "Luz pintada a mano; la raíz crece sin raya"],
      ["Rubios y decoloración", "Aclarado con Olaplex para cuidar la fibra"],
      ["Corrección de color", "Naranjas, manchas o rayas que hay que rescatar"],
      ["Cobrizos", "Cobre de natural a intenso, con brillo"],
      ["Matiz y brillo", "Ajuste del tono entre una sesión y otra"],
    ],
  },
  {
    name: "Corte y peinado",
    items: [
      ["Corte", "Pensado junto con el color, no aparte"],
      ["Peinado de evento", "Ondas, recogidos y semirrecogidos"],
    ],
  },
  {
    name: "Novias",
    items: [
      ["Maquillaje de novia", "Piel natural, pensada para las fotos"],
      ["Peinado de novia", "El peinado que ensayaste, el día de la boda"],
      ["Prueba previa", "Peinado y maquillaje antes del gran día"],
    ],
  },
] as const;

export function Services() {
  let row = 0;
  return (
    <section id="servicios" aria-labelledby="servicios-titulo" className="mt-section bg-ivory px-gutter py-[clamp(5rem,9vw,8rem)] text-ink">
      <SplitReveal
        id="servicios-titulo"
        lines={["Color primero,", "y todo lo demás"]}
        lineClassNames={["md:ml-[3vw]", ""]}
        className="text-title text-ink"
      />

      <div className="mt-16 grid gap-y-14 md:mt-24 md:grid-cols-12 md:gap-x-5">
        <div className="order-2 md:order-1 md:col-span-3 md:self-end">
          <Reveal order={2} className="ml-auto w-[60%] md:ml-0 md:w-full">
            <Parallax distance={40}>
              <div className="aspect-[4/5] overflow-hidden bg-pearl">
                <Picture
                  image={byId("shooting/shooting-06-2024-04-17")}
                  sizes="(min-width: 768px) 30vw, 60vw"
                  objectPosition="50% 30%"
                />
              </div>
            </Parallax>
            <p className="mt-3 text-small text-stone-deep">Balayage caramelo, último retoque frente al espejo.</p>
          </Reveal>
        </div>

        <div className="order-1 md:order-2 md:col-span-8 md:col-start-5">
          <ul>
            {groups.map((g, gi) =>
              g.items.map(([name, note], ii) => {
                const i = row++;
                return (
                  <Reveal as="li" key={name} order={(i % 5) + 1} className={gi > 0 && ii === 0 ? "mt-8 md:mt-11" : ""}>
                    <a
                      href={bookingLink(`Hola Diana, quiero agendar: ${name}.`)}
                      target="_blank"
                      rel="noopener"
                      className="group grid grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-1 py-3 transition-colors duration-[var(--dur-fast)] hover:bg-pearl md:-mx-3 md:grid-cols-[8.5rem_minmax(0,14rem)_1fr_auto] md:px-3"
                    >
                      <span className="hidden text-[0.9375rem] text-stone-deep md:block">{ii === 0 ? g.name : ""}</span>
                      <span className="text-body text-ink">{name}</span>
                      <span className="col-span-2 row-start-2 text-[0.9375rem] text-stone-deep md:col-span-1 md:col-start-3 md:row-start-1">
                        {note}
                      </span>
                      <span className="col-start-2 row-start-1 whitespace-nowrap text-[0.9375rem] text-ink md:col-start-4">
                        Agendar
                        <span
                          aria-hidden
                          className="ml-2 inline-block transition-transform duration-[var(--dur-base)] group-hover:translate-x-1"
                        >
                          →
                        </span>
                      </span>
                    </a>
                  </Reveal>
                );
              }),
            )}
          </ul>
          <Reveal order={3}>
            <p className="mt-12 max-w-[52ch] text-body text-ink">
              El precio depende del largo, del color de partida y de cuántas sesiones necesite tu cabello. Por eso
              Diana lo da después de ver una foto tuya.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
