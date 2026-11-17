import type { SiteImage } from "@/data/images";
import { Picture } from "./Picture";
import { ToneTag } from "./ToneTag";

type Props = {
  image: SiteImage;
  sizes: string;
  ratio?: string;
  caption?: string;
  className?: string;
  objectPosition?: string;
};

/**
 * "Card" del sistema: una pieza expuesta en la sala oscura.
 * Foto sin marco, sin sombra, sin esquinas redondeadas; pie debajo.
 * Las piezas cambian de tamaño y posición: nunca en filas idénticas.
 */
export function Exhibit({ image, sizes, ratio = "4 / 5", caption, className = "", objectPosition }: Props) {
  return (
    <figure className={`group ${className}`}>
      <div className="overflow-hidden bg-onyx">
        <Picture
          image={image}
          sizes={sizes}
          ratio={ratio}
          objectPosition={objectPosition}
          className="exhibit-img transition-transform duration-[900ms] ease-[var(--ease-out)] group-hover:scale-[1.025]"
        />
      </div>
      <figcaption className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        {image.tone ? <ToneTag tone={image.tone} /> : null}
        {caption ? <span className="text-small text-muted">{caption}</span> : null}
      </figcaption>
    </figure>
  );
}
