import type { SiteImage } from "@/data/images";

type Props = {
  image: Pick<SiteImage, "src" | "srcSet" | "width" | "height" | "alt">;
  /** Atributo sizes real del hueco que ocupa (p. ej. "(min-width: 768px) 40vw, 90vw"). */
  sizes: string;
  className?: string;
  /** Solo para la imagen del primer pantallazo. */
  eager?: boolean;
  /** Proporción del recorte; por defecto la de la foto. */
  ratio?: string;
  objectPosition?: string;
};

/** <img> con las variantes WebP generadas. Reserva espacio (sin CLS). */
export function Picture({ image, sizes, className = "", eager, ratio, objectPosition }: Props) {
  return (
    // Las variantes WebP ya están optimizadas por scripts/optimize-images.mjs; next/image las reprocesaría.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={image.src}
      srcSet={image.srcSet}
      sizes={sizes}
      width={image.width}
      height={image.height}
      alt={image.alt}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : undefined}
      decoding="async"
      className={`h-full w-full object-cover ${className}`}
      style={{ aspectRatio: ratio, objectPosition }}
    />
  );
}
