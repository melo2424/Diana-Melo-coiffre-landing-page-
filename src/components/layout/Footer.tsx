import { nav, site } from "@/data/site";

/**
 * Footer provisional (Prompt 4 lo termina): invierte fondo y tinta,
 * cuatro columnas arriba y el nombre a todo el ancho abajo.
 */
async function currentYear() {
  "use cache"; // se fija al compilar: compatible con cacheComponents
  return new Date().getFullYear();
}

export async function Footer() {
  const year = await currentYear();
  return (
    <footer className="bg-ivory text-ink">
      <div className="grid min-h-[80svh] grid-rows-[auto_1fr_auto] px-gutter pb-6 pt-14 md:pt-16">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 text-[0.9375rem] md:grid-cols-12">
          <div className="md:col-span-3">
            <p className="text-ink">Estudio</p>
            <p className="text-stone-deep">{site.address.line1}</p>
            <p className="text-stone-deep">{site.address.city}</p>
          </div>
          <div className="md:col-span-3">
            <p className="text-ink">Secciones</p>
            <ul>
              {nav.map((n) => (
                <li key={n.href}>
                  <a className="text-stone-deep transition-colors hover:text-ink" href={n.href}>
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-3">
            <p className="text-ink">Redes</p>
            <a
              className="text-stone-deep transition-colors hover:text-ink"
              href={site.instagram.url}
              target="_blank"
              rel="noopener"
            >
              Instagram {site.instagram.handle}
            </a>
          </div>
          <div className="md:col-span-3">
            <p className="text-ink">Horario</p>
            <ul className="tabular">
              {site.hours.map((h) => (
                <li key={h.days} className="text-stone-deep">
                  {h.days}: {h.time}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div aria-hidden />

        <div>
          <p
            aria-hidden
            className="whitespace-nowrap font-display text-[19.4vw] md:text-[20.2vw] leading-[0.8] tracking-[-0.045em] text-ink"
          >
            Diana Melo
          </p>
          <p className="mt-5 text-small text-stone-deep">
            © {year} {site.name}. Colorimetría, corte, peinado y maquillaje.
          </p>
        </div>
      </div>
    </footer>
  );
}
