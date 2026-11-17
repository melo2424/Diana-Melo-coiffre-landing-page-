import { byId, images } from "@/data/images";
import { bookingHref } from "@/data/site";
import { Button } from "@/components/ui/Button";
import { Picture } from "@/components/ui/Picture";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Exhibit } from "@/components/ui/Exhibit";
import { Reveal } from "@/components/motion/Reveal";

/**
 * PROMPT 1: base con marcadores de posición.
 * Cada sección lleva su encabezado real y una vista previa del plano (blueprint)
 * que se construirá en los prompts 2–4. Ver DESIGN.md §8 y CLAUDE.md › Roadmap.
 */

const heroImages = [
  byId("shooting/shooting-10-2024-06-01"),
  byId("shooting/shooting-08-2024-05-13"),
  byId("shooting/shooting-12-2024-08-14"),
];

function Placeholder({ blueprint, prompt }: { blueprint: string; prompt: number }) {
  return (
    <p className="mt-10 max-w-[38rem] text-body text-muted">
      En construcción · {blueprint} · se completa en el prompt {prompt}.
    </p>
  );
}

export default function Home() {
  const exhibits = [
    byId("trabajos/2026-10-19-desom3opuns"),
    byId("trabajos/2026-10-23-de1y2-xxi4u"),
    byId("trabajos/2026-09-29-dd5rj0vdvyb"),
  ];

  return (
    <>
      {/* HERO — el nombre como pieza: foto apagada arriba, nombre a todo el ancho abajo */}
      <section
        id="inicio"
        aria-labelledby="titulo"
        className="grid min-h-[100svh] grid-rows-[1fr_auto] pt-header"
      >
        {/* Tres clientas, tres rubios, la misma bata de satén negro del estudio */}
        <div className="mx-gutter mt-4 flex min-h-[46svh] gap-0">
          {heroImages.map((img, i) => (
            <div
              key={img.id}
              className={`relative overflow-hidden bg-onyx ${i === 0 ? "flex-[1.35]" : "hidden flex-1 md:block"}`}
            >
              <Picture
                image={img}
                eager={i === 0}
                sizes="(min-width: 768px) 40vw, 100vw"
                objectPosition="50% 30%"
                className="absolute inset-0 brightness-[0.78] contrast-[1.08]"
              />
            </div>
          ))}
        </div>

        <div className="px-gutter pb-8 pt-6 md:pb-10">
          <h1
            id="titulo"
            className="font-display text-[17.5vw] leading-[0.86] tracking-[-0.035em] text-text [font-variation-settings:'opsz'_96] md:whitespace-nowrap md:text-monument"
          >
            Diana Melo <span className="md:inline block">Coiffé</span>
          </h1>
          <div className="mt-6 flex flex-col gap-6 md:mt-8 md:flex-row md:items-end md:justify-between">
            <p className="max-w-[30ch] text-statement text-text">
              Colorista experta en balayage, rubios y corrección de color.
            </p>
            <div className="flex items-center gap-6">
              <Button href={bookingHref} target="_blank" rel="noopener" size="lg">
                Agendar cita
              </Button>
              <Button href="#trabajos" variant="quiet">
                Ver trabajos
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICIOS */}
      <section aria-labelledby="servicios" className="px-gutter pt-section">
        <Reveal>
          <SectionHeading
            id="servicios"
            title="Servicios"
            lede="Colorimetría primero: balayage, rubios, decoloración y corrección de color. También corte, peinado y maquillaje para novias."
          />
        </Reveal>
        <div className="mt-16 grid gap-10 md:grid-cols-12">
          {[
            { group: "Color", items: ["Balayage", "Rubios y decoloración", "Corrección de color", "Cobrizos", "Matiz y brillo"] },
            { group: "Corte y peinado", items: ["Corte profesional", "Peinado de evento", "Ondas y recogidos"] },
            { group: "Novias", items: ["Maquillaje de novia", "Peinado de novia", "Prueba previa"] },
          ].map((col, i) => (
            <Reveal key={col.group} order={i + 1} className="md:col-span-3">
              <p className="text-text">{col.group}</p>
              <ul className="mt-5 space-y-1.5 text-muted">
                {col.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
        <Placeholder blueprint="columnas de nombres a un solo tamaño, con descripción al pasar" prompt={2} />
      </section>

      {/* DIANA */}
      <section aria-labelledby="diana" className="px-gutter pt-section">
        <div className="grid gap-10 md:grid-cols-12">
          <Reveal className="md:col-span-6">
            <SectionHeading
              id="diana"
              title="Diana"
              lede="Colorista y estilista. Su trabajo se mueve entre el salón, las pasarelas regionales y las ferias de belleza."
            />
            <Placeholder blueprint="título fijo, retratos que pasan detrás" prompt={3} />
          </Reveal>
          <Reveal order={2} className="md:col-span-4 md:col-start-9">
            <Exhibit image={byId("trabajos/2026-10-04-degg4-rjff7")} sizes="(min-width: 768px) 30vw, 90vw" caption="Cluster Moda Orinoquía" />
          </Reveal>
        </div>
      </section>

      {/* TRABAJOS */}
      <section aria-labelledby="trabajos" className="px-gutter pt-section">
        <Reveal>
          <SectionHeading
            id="trabajos"
            title="Trabajos"
            lede="Cada color tiene nombre. Arena, cobre, perla: así sale cada clienta del estudio."
          />
        </Reveal>
        <div className="mt-16 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-12 md:gap-x-6">
          <Reveal order={1} className="col-span-2 md:col-span-4">
            {/* recorte alto: oculta el rótulo «Arena» incrustado en la foto */}
            <Exhibit image={exhibits[0]} sizes="(min-width: 768px) 32vw, 90vw" ratio="3 / 4" objectPosition="50% 12%" />
          </Reveal>
          <Reveal order={2} className="col-span-1 md:col-span-3 md:col-start-7 md:mt-[22vh]">
            <Exhibit image={exhibits[1]} sizes="(min-width: 768px) 24vw, 45vw" ratio="3 / 4" />
          </Reveal>
          <Reveal order={3} className="col-span-1 md:col-span-2 md:col-start-11 md:mt-[8vh]">
            <Exhibit image={exhibits[2]} sizes="(min-width: 768px) 16vw, 45vw" ratio="3 / 4" />
          </Reveal>
        </div>
        <Placeholder blueprint="parejas escalonadas + carta de tonos interactiva" prompt={3} />
      </section>

      {/* PRODUCTOS */}
      <section aria-labelledby="productos" className="pt-section">
        <div className="px-gutter">
          <Reveal>
            <SectionHeading
              id="productos"
              title="Productos"
              lede="Olaplex en el estudio: protege el enlace del cabello durante la decoloración. Vitrina, sin venta en línea."
            />
          </Reveal>
        </div>
        <Reveal order={1} className="mt-16 flex h-[56svh] min-h-[22rem] w-full">
          {images.olaplex.slice(0, 4).map((img, i) => (
            <div key={img.id} className="h-full overflow-hidden bg-onyx" style={{ flexGrow: [5, 2, 3, 2][i], flexBasis: 0 }}>
              <Picture image={img} sizes="40vw" className="exhibit-img" />
            </div>
          ))}
        </Reveal>
        <div className="px-gutter">
          <Placeholder blueprint="banda de paneles desiguales" prompt={4} />
        </div>
      </section>

      {/* UBICACIÓN */}
      <section aria-labelledby="ubicacion" className="px-gutter py-section">
        <Reveal>
          <SectionHeading
            id="ubicacion"
            title="Ubicación"
            lede="Dirección, horario y agendamiento por WhatsApp. Pendiente de confirmar con Diana."
          />
        </Reveal>
        <Placeholder blueprint="tarjeta de visita sobre fotografía a pantalla completa" prompt={4} />
      </section>
    </>
  );
}
