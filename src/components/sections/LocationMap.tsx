import { byId } from "@/data/images";
import { site } from "@/data/site";
import { agenda } from "@/lib/agenda/config";
import { Picture } from "@/components/ui/Picture";
import { Reveal } from "@/components/motion/Reveal";
import { MapFrame } from "./MapFrame";

const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const fmt = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return `${h % 12 || 12}${m ? `:${String(m).padStart(2, "0")}` : ""} ${h < 12 ? "a. m." : "p. m."}`;
};

/** Horario agrupado («Lunes a viernes · 9 a. m. – 6 p. m.»), sale de la configuración de la agenda. */
const hours = (() => {
  const order = [1, 2, 3, 4, 5, 6, 0];
  const label = (d: number) =>
    agenda.hours[d]?.length ? agenda.hours[d].map(([a, b]) => `${fmt(a)} – ${fmt(b)}`).join(", ") : "Cerrado";
  const rows: [string, string][] = [];
  let start = order[0];
  order.forEach((d, i) => {
    const next = order[i + 1];
    if (next === undefined || label(next) !== label(d)) {
      rows.push([start === d ? dayNames[d] : `${dayNames[start]} a ${dayNames[d].toLowerCase()}`, label(d)]);
      start = next;
    }
  });
  return rows;
})();

// Prioridad: dirección escrita → ficha de Google Maps del estudio → solo la ciudad.
const exact = Boolean(site.address || site.mapsPlace);
const place = site.address ? `${site.address}, ${site.city}, Colombia` : site.mapsPlace || `${site.city}, Colombia`;
// Embed de Google Maps sin API key. Con ubicación exacta se acerca más y se muestra el pin dorado.
const embed = `https://www.google.com/maps?q=${encodeURIComponent(place)}&z=${exact ? 16 : 13}&hl=es&output=embed`;
const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place)}${
  process.env.GOOGLE_PLACE_ID ? `&destination_place_id=${process.env.GOOGLE_PLACE_ID}` : ""
}`;

/**
 * Ubicación: el mapa de Google en la paleta de la sala oscura (filtro sobre el iframe)
 * con la tarjeta de visita marfil encima, como en el plano de DESIGN.md.
 */
export function LocationMap() {
  return (
    <Reveal className="mt-24 md:mt-32">
      <div className="relative flex flex-col overflow-hidden rounded-[1.75rem] bg-onyx ring-1 ring-white/5 lg:block lg:h-[36rem]">
        <div className="relative h-[22rem] sm:h-[26rem] lg:absolute lg:inset-0 lg:h-auto">
          <MapFrame src={embed} title={`Mapa: ${site.name}, ${site.city}`} pin={exact} />
          {/* velos: funden el mapa con la sala y le dan fondo a la tarjeta */}
          <div aria-hidden className="pointer-events-none absolute inset-0 shadow-[inset_0_0_80px_30px_var(--onyx)]" />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 hidden w-[55%] bg-gradient-to-r from-onyx via-onyx/70 to-transparent lg:block"
          />
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-onyx to-transparent lg:hidden" />
        </div>

        {/* tarjeta de visita */}
        <div className="relative z-10 mx-4 -mt-20 mb-4 rounded-[1.5rem] bg-ivory p-6 text-ink shadow-[0_30px_60px_-30px_rgb(0_0_0/0.9)] sm:mx-6 lg:absolute lg:left-10 lg:top-1/2 lg:m-0 lg:w-[24rem] lg:-translate-y-1/2 lg:p-8">
          <p className="text-small text-stone-deep">El estudio</p>
          <div className="mt-3 flex items-center gap-4">
            <div className="size-14 shrink-0 overflow-hidden rounded-full ring-1 ring-gold-deep/40">
              <Picture image={byId("shooting/shooting-03-2023-12-04-video-cover")} sizes="56px" objectPosition="50% 25%" />
            </div>
            <div>
              <p className="font-display text-[1.5rem] leading-tight">{site.name}</p>
              <p className="text-small text-stone-deep">{site.address ? `${site.address}, ${site.city}` : site.city}</p>
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-small">
            {hours.map(([d, h]) => (
              <div key={d} className="contents">
                <dt className="text-stone-deep">{d}</dt>
                <dd>{h}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-small text-stone-deep">
            Solo con cita previa.{exact ? "" : " Te envío la dirección exacta al confirmar tu cita."}
          </p>

          <a
            href={directions}
            target="_blank"
            rel="noopener"
            className="group mt-6 inline-flex h-12 items-center gap-3 rounded-full bg-ink pl-5 pr-1.5 text-small text-pearl transition-colors hover:bg-graphite"
          >
            Cómo llegar
            <span className="grid size-9 place-items-center rounded-full bg-gold text-ink transition-transform duration-500 group-hover:rotate-45">
              <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M4.5 11.5 11.5 4.5M5.5 4.5h6v6" />
              </svg>
            </span>
          </a>
        </div>
      </div>
    </Reveal>
  );
}
