/**
 * Catálogo de imágenes del sitio.
 * Las variantes WebP y sus dimensiones vienen de `image-manifest.json`,
 * que genera `npm run images` (scripts/optimize-images.mjs).
 * Aquí solo se escribe lo editorial: alt, categoría, tono y avisos.
 */
import manifest from "./image-manifest.json";

export type Category =
  | "balayage"
  | "rubios"
  | "cobrizos"
  | "corte"
  | "peinado"
  | "maquillaje"
  | "producto"
  | "trayectoria"
  | "marca";

export type Group = "trabajos" | "shooting" | "olaplex";

type Editorial = {
  alt: string;
  category: Category;
  /** Nombre de tono a la manera de Diana. Solo "Arena" está confirmado (lo usa en su publicación); el resto es propuesta. */
  tone?: string;
  /** La foto trae texto, sticker o marca de agua incrustada: no usar en tamaño grande. */
  overlay?: string;
  /** false = no mostrar en galerías (gráficos, capturas, fotos de terceros). */
  showcase?: boolean;
};

export type SiteImage = Editorial & {
  id: string;
  group: Group;
  width: number;
  height: number;
  src: string; // variante más grande
  srcSet: string;
};

const editorial: Record<Group, Record<string, Editorial>> = {
  trabajos: {
    "2026-08-29-dcopqbwxmje": {
      alt: "Diana Melo en la alfombra roja de un evento de moda del Cluster Moda Orinoquía",
      category: "trayectoria",
    },
    "2026-08-31-dcue8nyfzsh": {
      alt: "Cabello largo rubio champaña con raíz castaña difuminada, visto de perfil sobre bata negra",
      category: "balayage",
      tone: "Champaña",
    },
    "2026-09-09-ddexmsmrjwj": {
      alt: "Ondas largas en balayage miel y caramelo sobre base castaña, vistas de espalda",
      category: "balayage",
      tone: "Miel",
      overlay: "Texto de la historia de Instagram sobre la foto",
    },
    "2026-09-12-ddmmavjdhjt": {
      alt: "Melena larga y lisa en rubio claro con raíz suave, vista de espalda en el salón",
      category: "rubios",
    },
    "2026-09-17-ddznl9uv3xr": {
      alt: "Rubio beige con mechas finas y raíz natural, cabello largo y liso visto de espalda",
      category: "rubios",
      tone: "Beige",
    },
    "2026-09-20-ddhk4fvdy81": {
      alt: "Cabello largo con ondas en degradado de castaño a miel cobriza, visto de espalda",
      category: "balayage",
      tone: "Miel",
    },
    "2026-09-21-ddkencevupw": {
      alt: "Estilista invitado peinando un recogido de novia durante una demostración en escenario",
      category: "trayectoria",
      overlay: "Texto de la historia de Instagram",
      showcase: false,
    },
    "2026-09-21-ddks5xwjxbb": {
      alt: "Diana Melo con gafas de sol en una feria de belleza, con el escenario principal al fondo",
      category: "trayectoria",
    },
    "2026-09-22-ddmzgsmj6ze": {
      alt: "Clienta de perfil con balayage rubio miel y ondas suaves, sobre bata negra con el monograma dorado",
      category: "balayage",
      tone: "Miel",
    },
    "2026-09-23-ddo1qlhlniz": {
      alt: "Cabello largo rizado en rubio dorado oscuro, definido y con volumen, visto de espalda",
      category: "rubios",
      tone: "Dorado",
    },
    "2026-09-24-ddq5aacrgy": {
      alt: "Diana Melo junto a una invitada en un evento social",
      category: "trayectoria",
    },
    "2026-09-29-dd5rj0vdvyb": {
      alt: "Rubio perla muy largo y liso con brillo de espejo, visto de espalda",
      category: "rubios",
      tone: "Perla",
    },
    "2026-10-03-dec5mouv6m5": {
      alt: "Tratamiento reparador aplicado en el lavacabezas antes de un servicio de color",
      category: "producto",
      overlay: "Texto «pelito y su color»; producto de otra marca",
      showcase: false,
    },
    "2026-10-04-degg4-rjff7": {
      alt: "Diana Melo junto a un diseñador vestido de blanco en un evento del Cluster Moda Orinoquía",
      category: "trayectoria",
    },
    "2026-10-07-denaj2oj4g2": {
      alt: "Cabello largo cobrizo, lacio y brillante, con flequillo largo y capas",
      category: "cobrizos",
      tone: "Cobre",
    },
    "2026-10-14-defcrvtd-fb": {
      alt: "Clienta con rubio vainilla en ondas amplias y raíz natural difuminada, mirando hacia abajo",
      category: "rubios",
      tone: "Vainilla",
    },
    "2026-10-19-desom3opuns": {
      alt: "Ondas largas en balayage arena sobre base castaña oscura, vistas de espalda",
      category: "balayage",
      tone: "Arena",
      overlay: "Rótulo «Arena» sobre la foto",
    },
    "2026-10-23-de1y2-xxi4u": {
      alt: "Cabello largo cobrizo intenso con ondas suaves, sobre camiseta con el logo bordado de Diana Melo",
      category: "cobrizos",
      tone: "Cobre",
    },
    "2026-10-26-de-pk5bf-jg": {
      alt: "Clienta con rubio claro en ondas frente al cuadro de alas plateadas del salón",
      category: "rubios",
      tone: "Champaña",
    },
    "2026-10-28-dfc-ebsiim9": {
      alt: "Corte bob recto a la altura de los hombros con degradado de castaño a rubio, sobre bata con monograma dorado",
      category: "corte",
    },
    "2026-10-31-dfk4qhij3tr": {
      alt: "Cabello largo en ondas con balayage chocolate y caramelo, visto de espalda",
      category: "balayage",
      tone: "Chocolate",
    },
    "2026-11-04-dfu5grsrsyo": {
      alt: "Clienta con melena larga en ondas y balayage castaño claro, con la mano en el cabello",
      category: "balayage",
      tone: "Caramelo",
      overlay: "Marca de agua de TikTok",
    },
  },
  shooting: {
    "shooting-01-2022-08-01": {
      alt: "Portada gráfica con ícono de cámara dorado y monograma DM sobre fondo marfil",
      category: "marca",
      showcase: false,
    },
    "shooting-02-2023-11-04": {
      alt: "Clienta sonriente con rubio cenizo en ondas largas, en un salón con techo de madera",
      category: "rubios",
      tone: "Ceniza",
    },
    "shooting-03-2023-12-04-video-cover": {
      alt: "Clienta con rubio miel en ondas y bata de satén negra, de brazos cruzados junto a un árbol de Navidad",
      category: "balayage",
      tone: "Miel",
    },
    "shooting-04-2024-02-05": {
      alt: "Clienta de perfil con cabello largo castaño y mechas cobrizas en ondas",
      category: "balayage",
      tone: "Cobre",
      overlay: "Marca de agua @dianamelosalon",
    },
    "shooting-05-2024-04-17": {
      alt: "Clienta con bob a la altura de la mandíbula y mechas rubias frontales sobre base oscura",
      category: "corte",
    },
    "shooting-06-2024-04-17": {
      alt: "Clienta con balayage castaño claro largo mientras la estilista acomoda un mechón",
      category: "balayage",
      tone: "Caramelo",
    },
    "shooting-07-2024-05-12-video-cover": {
      alt: "Clienta con maquillaje de acabado natural y cabello largo y lacio con mechas beige",
      category: "maquillaje",
      overlay: "Marca de agua @dianamelosalon",
    },
    "shooting-08-2024-05-13": {
      alt: "Clienta de perfil con rubio platino cenizo en ondas largas",
      category: "rubios",
      tone: "Platino",
    },
    "shooting-09-2024-05-14": {
      alt: "Clienta sonriente con balayage rubio dorado y bata de satén negra",
      category: "balayage",
      tone: "Dorado",
    },
    "shooting-10-2024-06-01": {
      alt: "Clienta con rubio perla en ondas largas sobre bata de satén negra, con fondo oscuro",
      category: "rubios",
      tone: "Perla",
    },
    "shooting-11-2024-06-15": {
      alt: "Clienta con rizos largos y definidos en balayage castaño y dorado",
      category: "balayage",
      tone: "Dorado",
    },
    "shooting-12-2024-08-14": {
      alt: "Clienta con rubio beige largo y bata de satén negra, junto a una puerta de madera",
      category: "rubios",
      tone: "Beige",
    },
    "shooting-13-2024-08-15": {
      alt: "Dos mujeres abrazadas en batas de satén dorada y negra; la de negro luce balayage miel",
      category: "balayage",
      tone: "Miel",
      overlay: "Texto #tbt",
    },
  },
  olaplex: {
    "2025-03-28-dhwhf-wudiz": {
      alt: "Olaplex N.º1 Bond Multiplier y N.º2 Bond Perfector junto a material de laboratorio, sobre fondo negro",
      category: "producto",
    },
    "2026-07-13-datxwxtjrqu-1": {
      alt: "Línea Olaplex de cuidado en casa sobre un mueble de madera con plantas",
      category: "producto",
    },
    "2026-08-01-dbgeyfeu0k6-reel-cover": {
      alt: "Champú N.º4 y acondicionador N.º5 de Olaplex sobre espuma",
      category: "producto",
    },
    "2026-09-16-ddvnk9ehndc-reel-cover": {
      alt: "Productos Olaplex en un estante de baño junto a una taza blanca",
      category: "producto",
    },
    "2026-09-21-ddjgpkgjqmi-1": {
      alt: "Champú N.º4P y acondicionador N.º5P Blonde Enhancer de Olaplex, matizantes para rubios",
      category: "producto",
    },
    "2026-10-23-de1skrfnya": {
      alt: "Manos con uñas rojas sostienen tratamientos Olaplex frente a una chaqueta negra",
      category: "producto",
    },
    "captura-de-pantalla-2026-11-09-164829": {
      alt: "Olaplex N.º1 y N.º2 entre matraces de laboratorio con líquido ámbar",
      category: "producto",
      overlay: "Es una captura de pantalla: confirmar derechos de uso",
    },
  },
};

type ManifestEntry = {
  slug: string;
  width: number;
  height: number;
  variants: { w: number; src: string }[];
};

const build = (group: Group): SiteImage[] =>
  (manifest[group] as ManifestEntry[]).map((m) => {
    const ed = editorial[group][m.slug];
    if (!ed) throw new Error(`Falta texto editorial para ${group}/${m.slug}`);
    const largest = m.variants[m.variants.length - 1];
    return {
      id: `${group}/${m.slug}`,
      group,
      width: m.width,
      height: m.height,
      src: largest.src,
      srcSet: m.variants.map((v) => `${v.src} ${v.w}w`).join(", "),
      showcase: true,
      ...ed,
    };
  });

export const images = {
  trabajos: build("trabajos"),
  shooting: build("shooting"),
  olaplex: build("olaplex"),
};

export const allImages: SiteImage[] = [
  ...images.trabajos,
  ...images.shooting,
  ...images.olaplex,
];

export const byId = (id: string): SiteImage => {
  const img = allImages.find((i) => i.id === id);
  if (!img) throw new Error(`Imagen no encontrada: ${id}`);
  return img;
};

export const byCategory = (c: Category) =>
  allImages.filter((i) => i.category === c && i.showcase !== false);
