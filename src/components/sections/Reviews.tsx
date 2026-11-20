import { cacheLife } from "next/cache";
import { Reveal } from "@/components/motion/Reveal";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Cta } from "@/components/ui/Cta";

/**
 * Reseñas REALES del perfil de Google de Diana (Places API).
 * Variables: GOOGLE_PLACES_API_KEY y GOOGLE_PLACE_ID. Sin ellas, la sección no aparece.
 * Nunca se escriben reseñas a mano.
 */
type Review = {
  rating: number;
  text?: { text: string };
  originalText?: { text: string };
  relativePublishTimeDescription?: string;
  authorAttribution?: { displayName?: string; uri?: string };
};
type Place = { rating?: number; userRatingCount?: number; googleMapsUri?: string; reviews?: Review[] };

async function getPlace(): Promise<Place | null> {
  "use cache";
  cacheLife("hours");
  const key = process.env.GOOGLE_PLACES_API_KEY;
  const id = process.env.GOOGLE_PLACE_ID;
  if (!key || !id) return null;
  try {
    const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(id)}?languageCode=es`, {
      headers: { "X-Goog-Api-Key": key, "X-Goog-FieldMask": "rating,userRatingCount,googleMapsUri,reviews" },
    });
    if (!res.ok) throw new Error(`Places ${res.status}: ${await res.text()}`);
    return (await res.json()) as Place;
  } catch (err) {
    console.error("[reseñas]", err);
    return null;
  }
}

function Stars({ value, className = "" }: { value: number; className?: string }) {
  return (
    <span className={`inline-flex gap-0.5 ${className}`} aria-label={`${value.toFixed(1)} de 5`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <svg key={i} viewBox="0 0 20 20" className="size-[1em]" aria-hidden>
            <defs>
              <linearGradient id={`st${i}-${Math.round(fill * 100)}`}>
                <stop offset={fill} stopColor="var(--gold)" />
                <stop offset={fill} stopColor="var(--graphite)" />
              </linearGradient>
            </defs>
            <path
              d="M10 1.8l2.5 5.2 5.7.8-4.1 4 1 5.6L10 14.7l-5.1 2.7 1-5.6-4.1-4 5.7-.8z"
              fill={`url(#st${i}-${Math.round(fill * 100)})`}
            />
          </svg>
        );
      })}
    </span>
  );
}

export async function Reviews() {
  const place = await getPlace();
  const reviews = (place?.reviews ?? []).filter((r) => (r.text?.text ?? r.originalText?.text)?.trim()).slice(0, 6);
  if (!place || !reviews.length) return null;

  return (
    <section id="resenas" aria-labelledby="resenas-titulo" className="overflow-x-clip px-gutter pt-section">
      <div className="flex flex-wrap items-end justify-between gap-8">
        <div>
          <SplitReveal id="resenas-titulo" lines={["Lo que dicen", "de Diana"]} className="text-title text-text" />
          {place.rating ? (
            <Reveal order={1}>
              <p className="mt-6 flex items-center gap-3 text-body text-text">
                <span className="font-display text-[2.5rem] leading-none text-gold-light">{place.rating.toFixed(1)}</span>
                <Stars value={place.rating} className="text-[1.25rem]" />
                <span className="text-muted">{place.userRatingCount} reseñas en Google</span>
              </p>
            </Reveal>
          ) : null}
        </div>
        {place.googleMapsUri ? (
          <Cta href={place.googleMapsUri} variant="ghost">
            Ver todas en Google
          </Cta>
        ) : null}
      </div>

      <ul className="-mx-gutter mt-12 flex snap-x gap-4 overflow-x-auto px-gutter pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {reviews.map((r, i) => {
          const text = (r.text?.text ?? r.originalText?.text ?? "").trim();
          return (
            <Reveal as="li" key={i} order={i + 1} className="w-[82vw] shrink-0 snap-start sm:w-[24rem]">
              <figure className="flex h-full flex-col rounded-[1.5rem] bg-onyx p-6 ring-1 ring-white/5">
                <Stars value={r.rating} className="text-[1rem]" />
                <blockquote className="mt-4 line-clamp-[8] flex-1 text-body text-text">“{text}”</blockquote>
                <figcaption className="mt-5 text-small text-muted">
                  {r.authorAttribution?.uri ? (
                    <a href={r.authorAttribution.uri} target="_blank" rel="noopener" className="text-text hover:text-gold-light">
                      {r.authorAttribution.displayName}
                    </a>
                  ) : (
                    <span className="text-text">{r.authorAttribution?.displayName}</span>
                  )}
                  {r.relativePublishTimeDescription ? ` · ${r.relativePublishTimeDescription}` : ""}
                </figcaption>
              </figure>
            </Reveal>
          );
        })}
      </ul>
      <p className="mt-3 text-[0.8125rem] text-muted">Reseñas publicadas en Google por clientas reales.</p>
    </section>
  );
}
