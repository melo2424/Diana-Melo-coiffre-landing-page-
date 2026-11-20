import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { families, portfolio, tones } from "@/data/images";
import { bookingLink } from "@/data/site";
import { toneFromSlug, toneSlug } from "@/lib/tone-slug";
import { Picture } from "@/components/ui/Picture";
import { Cta } from "@/components/ui/Cta";
import { Reveal } from "@/components/motion/Reveal";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { WhatsAppIcon } from "@/components/layout/WhatsAppButton";

export function generateStaticParams() {
  return Object.keys(tones).map((t) => ({ tono: toneSlug(t) }));
}

export async function generateMetadata({ params }: { params: Promise<{ tono: string }> }): Promise<Metadata> {
  const t = toneFromSlug((await params).tono);
  if (!t) return {};
  const title = `Mi tono ${t}`;
  const description = `Trabajos de color en tono ${t} de Diana Melo, colorista en Villavicencio.`;
  return { title, description, alternates: { canonical: `/tono/${toneSlug(t)}` }, openGraph: { title, description } };
}

/** El shell no depende de la URL; el contenido del tono entra detrás de Suspense (ya prerenderizado por generateStaticParams). */
export default function TonePage({ params }: { params: Promise<{ tono: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-svh" />}>
      <ToneContent params={params} />
    </Suspense>
  );
}

async function ToneContent({ params }: { params: Promise<{ tono: string }> }) {
  const tone = toneFromSlug((await params).tono);
  if (!tone) notFound();
  const works = portfolio.filter((p) => p.tone === tone);
  const family = families.find((f) => f.id === works[0]?.category);

  return (
    <article className="px-gutter pb-section pt-[calc(var(--header-h)+4rem)]">
      <div className="grid items-end gap-y-10 lg:grid-cols-12 lg:gap-x-10">
        <div className="lg:col-span-6">
          <span aria-hidden className="swatch block size-24 md:size-32" style={{ background: tones[tone] }} />
          <SplitReveal lines={[`Tono ${tone}`]} className="mt-8 text-title text-text" />
          <Reveal order={1}>
            <p className="mt-6 max-w-[40ch] text-statement text-text">
              {works.length
                ? `${works.length} ${works.length === 1 ? "trabajo" : "trabajos"} de Diana en este tono${family ? `, sobre todo en ${family.label.toLowerCase()}` : ""}.`
                : "Un tono de la carta de Diana. Pregúntale cómo se vería en tu cabello."}
            </p>
          </Reveal>
        </div>
        <Reveal order={2} className="flex flex-wrap gap-3 lg:col-span-6 lg:justify-end">
          <Cta href="/#agendar" size="lg">
            Agendar diagnóstico
          </Cta>
          <Cta href={bookingLink(`Hola Diana, me encanta el tono ${tone}. ¿Cómo se vería en mi cabello?`)} variant="ghost" size="lg" icon={<WhatsAppIcon />}>
            Preguntarle a Diana
          </Cta>
        </Reveal>
      </div>

      {works.length ? (
        <ul className="mt-16 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5 lg:grid-cols-4">
          {works.map((w, i) => (
            <Reveal as="li" key={w.id} order={i} className="aspect-[3/4] overflow-hidden rounded-[1.25rem] bg-onyx">
              <Picture image={w} sizes="(min-width: 1024px) 22vw, 46vw" objectPosition="50% 30%" />
            </Reveal>
          ))}
        </ul>
      ) : null}

      <nav aria-label="Otros tonos" className="mt-20">
        <p className="text-small text-muted">Otros tonos de la carta</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {Object.keys(tones)
            .filter((t) => t !== tone)
            .map((t) => (
              <li key={t}>
                <Link
                  href={`/tono/${toneSlug(t)}`}
                  className="flex h-10 items-center gap-2 rounded-full pl-1 pr-3.5 text-small text-text ring-1 ring-graphite hover:ring-gold/60"
                >
                  <span aria-hidden className="swatch size-8" style={{ background: tones[t] }} />
                  {t}
                </Link>
              </li>
            ))}
        </ul>
      </nav>
    </article>
  );
}
