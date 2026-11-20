import manifest from "./image-manifest.json";

/**
 * Parejas de antes y después. Las fotos van en dianamelocolorlab/antes-despues/
 * como <nombre>-antes.jpg y <nombre>-despues.jpg (ver el LEEME de esa carpeta).
 * Aquí se escribe lo editorial de cada pareja, con la clave <nombre>.
 * Mientras no haya parejas, la sección no se muestra.
 */
const captions: Record<string, { tone: string; title: string; note?: string }> = {
  // "balayage-laura": { tone: "Miel", title: "De castaño a balayage miel", note: "Una sesión, con Olaplex." },
};

type Entry = { slug: string; width: number; height: number; variants: { w: number; src: string }[] };
type Img = { src: string; srcSet: string; width: number; height: number; alt: string };

const entries = ((manifest as Record<string, Entry[] | undefined>)["antes-despues"] ?? []) as Entry[];

const toImg = (e: Entry, alt: string): Img => ({
  src: e.variants[e.variants.length - 1].src,
  srcSet: e.variants.map((v) => `${v.src} ${v.w}w`).join(", "),
  width: e.width,
  height: e.height,
  alt,
});

export type Pair = { id: string; tone: string; title: string; note?: string; before: Img; after: Img };

export const pairs: Pair[] = Object.entries(captions).flatMap(([id, c]) => {
  const b = entries.find((e) => e.slug === `${id}-antes`);
  const a = entries.find((e) => e.slug === `${id}-despues`);
  if (!b || !a) return [];
  return [{ id, ...c, before: toImg(b, `Antes: ${c.title}`), after: toImg(a, `Después: ${c.title}`) }];
});
