import { bookingHref, nav, site } from "@/data/site";
import { Monogram, Tagline, Wordmark } from "@/components/brand/Logo";
import { WhatsAppIcon } from "@/components/layout/WhatsAppButton";
import { Cta } from "@/components/ui/Cta";

async function currentYear() {
  "use cache"; // se fija al compilar: compatible con cacheComponents
  return new Date().getFullYear();
}

/** Footer negro: el logotipo en blanco, animado, y el contacto directo por WhatsApp. */
export async function Footer() {
  const year = await currentYear();
  return (
    <footer
      // el logo en tono "ivory" lee --ivory: aquí lo forzamos a blanco puro
      style={{ "--ivory": "#ffffff" } as React.CSSProperties}
      className="flex min-h-[88svh] flex-col justify-between gap-16 bg-black px-gutter pt-8 pb-6 text-white md:min-h-[100svh]"
    >
      <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
        <nav aria-label="Pie de página">
          <ul className="space-y-1 text-body">
            {nav.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="hover:text-gold-light">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-col gap-6 text-body sm:items-end sm:text-right">
          <Cta href={bookingHref} icon={<WhatsAppIcon />} className="w-fit">
            Escríbeme por WhatsApp
          </Cta>
          <div>
            <a href={site.instagram.url} target="_blank" rel="noopener" className="block hover:text-gold-light">
              Instagram {site.instagram.handle}
            </a>
            <p>{site.city}</p>
          </div>
        </div>
      </div>

      <div>
        <p className="sr-only">{site.name}</p>
        <Monogram play="inView" tone="ivory" className="mb-8 w-[28%] max-w-[14rem]" />
        <Wordmark play="inView" delay={0.4} tone="ivory" className="w-full" />
        <Tagline play="inView" delay={1.2} tone="ivory" className="mt-[1.6vw] w-[38%] max-w-[40rem]" />
        <p className="mt-8 text-small text-white/70">
          © {year} {site.name}. Colorimetría, corte, peinado y maquillaje.
        </p>
      </div>
    </footer>
  );
}
