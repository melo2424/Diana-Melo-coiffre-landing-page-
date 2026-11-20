import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { care, careFor } from "@/data/care";
import { families, portfolio } from "@/data/images";
import { bookingLink, site } from "@/data/site";
import { Picture } from "@/components/ui/Picture";
import { Reveal } from "@/components/motion/Reveal";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { RetouchReminder } from "./RetouchReminder";
import { Cta } from "@/components/ui/Cta";
import { WhatsAppIcon } from "@/components/layout/WhatsAppButton";

export function generateStaticParams() {
  return care.map((c) => ({ familia: c.family }));
}

export async function generateMetadata({ params }: { params: Promise<{ familia: string }> }): Promise<Metadata> {
  const c = careFor((await params).familia);
  if (!c) return {};
  return { title: c.title, description: c.lede, alternates: { canonical: `/cuidado/${c.family}` } };
}

/** Guía de cuidado en casa por familia de color. Diana la manda por WhatsApp o la pone en un QR del estudio. */
/** El shell no depende de la URL; el contenido del familia entra detrás de Suspense (ya prerenderizado por generateStaticParams). */
export default function CarePage({ params }: { params: Promise<{ familia: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-svh" />}>
      <CareContent params={params} />
    </Suspense>
  );
}

async function CareContent({ params }: { params: Promise<{ familia: string }> }) {
  const c = careFor((await params).familia);
  if (!c) notFound();
  const photo = portfolio.find((p) => p.category === c.family);

  return (
    <article className="px-gutter pb-section pt-[calc(var(--header-h)+4rem)]">
      <nav aria-label="Otras guías" className="flex flex-wrap gap-2">
        {care.map((x) => (
          <Link
            key={x.family}
            href={`/cuidado/${x.family}`}
            aria-current={x.family === c.family ? "page" : undefined}
            className={`h-10 rounded-full px-4 text-small leading-10 transition-colors ${
              x.family === c.family ? "bg-gold text-ink" : "text-muted ring-1 ring-graphite hover:text-text"
            }`}
          >
            {families.find((f) => f.id === x.family)?.label}
          </Link>
        ))}
      </nav>

      <div className="mt-12 grid gap-y-12 lg:grid-cols-12 lg:gap-x-10">
        <div className="lg:col-span-7">
          <SplitReveal lines={[c.title]} className="text-title text-text" />
          <Reveal order={1}>
            <p className="mt-6 max-w-[48ch] text-statement text-text">{c.lede}</p>
          </Reveal>

          <ol className="mt-12 space-y-7">
            {c.steps.map((s, i) => (
              <Reveal as="li" key={s.title} order={i + 1} className="flex gap-5">
                <span className="grid size-10 shrink-0 place-items-center rounded-full font-display text-[1.125rem] text-gold-light ring-1 ring-gold/45">
                  {i + 1}
                </span>
                <div>
                  <p className="font-display text-[1.375rem] leading-tight text-text">{s.title}</p>
                  <p className="mt-1 max-w-[52ch] text-body text-muted">{s.text}</p>
                </div>
              </Reveal>
            ))}
          </ol>

          <Reveal>
            <h2 className="mt-16 font-display text-statement text-text">En tu baño</h2>
            <ul className="mt-6 space-y-4">
              {c.products.map((p) => (
                <li key={p.name} className="rounded-2xl bg-onyx p-5 ring-1 ring-white/5">
                  <p className="text-body text-text">{p.name}</p>
                  <p className="mt-1 text-small text-muted">{p.why}</p>
                </li>
              ))}
            </ul>
            <h2 className="mt-12 font-display text-statement text-text">Mejor evita</h2>
            <ul className="mt-5 space-y-2">
              {c.avoid.map((a) => (
                <li key={a} className="flex gap-3 text-body text-muted">
                  <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-[#f0a29a]" />
                  {a}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <aside className="lg:col-span-5">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
            {photo ? (
              <div className="aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-onyx">
                <Picture image={photo} sizes="(min-width: 1024px) 36vw, 92vw" objectPosition="50% 30%" />
              </div>
            ) : null}
            <div className="mt-6 rounded-[1.5rem] bg-onyx p-6 ring-1 ring-white/5">
              <p className="text-small text-muted">Tu próximo retoque</p>
              <p className="mt-1 font-display text-[2rem] leading-tight text-gold-light">
                En {c.retouch[0]} a {c.retouch[1]} semanas
              </p>
              <p className="mt-1 text-small text-muted">Para {c.retouchWhat}.</p>
              <RetouchReminder weeks={c.retouch[0]} what={c.retouchWhat} bookingUrl={`${site.url}/#agendar`} />
              <Cta
                href={bookingLink(`Hola Diana, tengo una duda sobre el cuidado de mi color (${c.title.toLowerCase()}).`)}
                variant="ghost"
                icon={<WhatsAppIcon />}
                className="mt-3"
              >
                Pregúntale a Diana
              </Cta>
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}
