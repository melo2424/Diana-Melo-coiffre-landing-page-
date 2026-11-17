import { byId } from "@/data/images";
import { bookingHref, nav, site } from "@/data/site";
import { Picture } from "@/components/ui/Picture";
import { Tagline, Wordmark } from "@/components/brand/Logo";

async function currentYear() {
  "use cache"; // se fija al compilar: compatible con cacheComponents
  return new Date().getFullYear();
}

/** El footer es la última foto: el nombre corre a todo el ancho sobre ella. */
export async function Footer() {
  const year = await currentYear();
  return (
    <footer className="relative isolate flex min-h-[88svh] flex-col justify-between overflow-hidden text-ivory md:min-h-[100svh]">
      <div className="absolute inset-0 -z-10">
        <Picture
          image={byId("shooting/shooting-12-2024-08-14")}
          sizes="100vw"
          objectPosition="50% 36%"
          className="brightness-[0.55]"
        />
      </div>

      <div className="flex flex-col gap-10 px-gutter pt-8 sm:flex-row sm:justify-between">
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
        <div className="text-body sm:text-right">
          <a href={bookingHref} target="_blank" rel="noopener" className="block hover:text-gold-light">
            Agendar cita
          </a>
          <a href={site.instagram.url} target="_blank" rel="noopener" className="block hover:text-gold-light">
            Instagram {site.instagram.handle}
          </a>
          <p>{site.city}</p>
        </div>
      </div>

      <div className="px-gutter pb-6">
        <p className="sr-only">{site.name}</p>
        <Wordmark play="inView" tone="ivory" className="w-full" />
        <Tagline play="inView" delay={0.8} className="mt-[1.6vw] w-[38%] max-w-[40rem]" />
        <p className="mt-8 text-small">
          © {year} {site.name}. Colorimetría, corte, peinado y maquillaje.
        </p>
      </div>
    </footer>
  );
}
