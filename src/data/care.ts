import type { Family } from "./images";

/**
 * Guías de cuidado en casa por familia de color (/cuidado/<familia>).
 * POR CONFIRMAR con Diana: semanas de retoque, pasos y productos. Solo se nombran
 * productos Olaplex que ya aparecen en la vitrina de la página.
 */
export type Care = {
  family: Family;
  title: string;
  lede: string;
  /** Semanas recomendadas hasta el retoque [mín, máx]. */
  retouch: [number, number];
  retouchWhat: string;
  steps: { title: string; text: string }[];
  products: { name: string; why: string }[];
  avoid: string[];
};

export const care: Care[] = [
  {
    family: "rubios",
    title: "Tu rubio en casa",
    lede: "Un rubio bonito se cuida en dos frentes: la fibra, que viene de un aclarado, y el matiz, que con el agua tiende al amarillo.",
    retouch: [6, 8],
    retouchWhat: "retoque de raíz y matiz",
    steps: [
      { title: "Lava con agua tibia o fría", text: "El agua caliente abre la cutícula y el matiz se va más rápido." },
      { title: "Matiza una vez por semana", text: "Alterna tu champú de siempre con uno matizante para frenar el amarillo." },
      { title: "Repara entre lavados", text: "Un tratamiento de reconstrucción a la semana mantiene la fibra fuerte después del aclarado." },
      { title: "Protege del calor", text: "Siempre termoprotector antes de secador, plancha o rizador." },
    ],
    products: [
      { name: "Olaplex N.º4P y N.º5P", why: "Llevan pigmento violeta: neutralizan el amarillo entre una visita y otra." },
      { name: "Olaplex N.º4 y N.º5", why: "Para los días en que no matizas." },
    ],
    avoid: ["Piscina con cloro sin proteger el cabello", "Planchar todos los días", "Tintes de caja entre citas"],
  },
  {
    family: "balayage",
    title: "Tu balayage en casa",
    lede: "El balayage crece sin raya marcada, así que aguanta más entre citas. Lo que más pide es brillo y un matiz al día.",
    retouch: [12, 16],
    retouchWhat: "matiz y refresco de luces",
    steps: [
      { title: "Lava dos o tres veces por semana", text: "Menos lavados, más duración del matiz." },
      { title: "Hidrata medios y puntas", text: "Las zonas aclaradas son las más porosas: ahí va el acondicionador." },
      { title: "Matiza cada 15 días", text: "Si tus luces son rubias o beige, un matizante evita que se vean amarillas." },
      { title: "Seca con calor medio", text: "Con termoprotector, las ondas duran y el brillo también." },
    ],
    products: [
      { name: "Olaplex N.º4 y N.º5", why: "Limpian y suavizan sin resecar las luces." },
      { name: "Olaplex N.º4P y N.º5P", why: "Solo si tus luces son claras: frenan el amarillo." },
    ],
    avoid: ["Agua muy caliente", "Champús anticaspa o de limpieza profunda a diario"],
  },
  {
    family: "cobrizos",
    title: "Tu cobrizo en casa",
    lede: "El cobre es el pigmento que más rápido se escapa con el agua. El cuidado está en lavar menos y proteger del sol.",
    retouch: [6, 8],
    retouchWhat: "refresco de color",
    steps: [
      { title: "Espera 72 horas para el primer lavado", text: "Deja que el pigmento se asiente." },
      { title: "Lava con agua fría", text: "Es lo que más alarga la intensidad del cobre." },
      { title: "Protege del sol", text: "El sol apaga el cobre: gorra o protector capilar en la playa y la piscina." },
      { title: "Hidrata con frecuencia", text: "Una fibra hidratada refleja más luz y el color se ve más vivo." },
    ],
    products: [{ name: "Olaplex N.º4 y N.º5", why: "Limpieza suave que no arrastra el pigmento." }],
    avoid: ["Champús matizantes violetas (apagan el cobre)", "Lavar todos los días"],
  },
  {
    family: "rizos",
    title: "Tus rizos con color en casa",
    lede: "El color en rizos pide el doble de hidratación: la definición y el brillo dependen de ella.",
    retouch: [10, 12],
    retouchWhat: "matiz e hidratación profunda",
    steps: [
      { title: "Desenreda solo con acondicionador", text: "Con los dedos o peine de dientes anchos, nunca en seco." },
      { title: "Hidrata cada semana", text: "Una mascarilla de hidratación mantiene la forma del rizo." },
      { title: "Seca con difusor", text: "Calor bajo y sin frotar con la toalla." },
      { title: "Duerme con funda de satén", text: "Menos frizz y menos roce en las puntas aclaradas." },
    ],
    products: [{ name: "Olaplex N.º4 y N.º5", why: "Limpian sin quitar la hidratación del rizo." }],
    avoid: ["Cepillar en seco", "Toallas de algodón ásperas"],
  },
  {
    family: "cortes",
    title: "Tu corte en casa",
    lede: "Un buen corte se nota en la caída. Mantenerlo es cuestión de puntas sanas y un secado sencillo.",
    retouch: [8, 10],
    retouchWhat: "mantenimiento del corte",
    steps: [
      { title: "Seca en la dirección del corte", text: "Con cepillo redondo, de raíz a puntas." },
      { title: "Protege las puntas", text: "Unas gotas de sérum o aceite en medios y puntas." },
      { title: "No esperes a las horquillas", text: "Retocar a tiempo conserva la forma del corte." },
    ],
    products: [{ name: "Olaplex N.º4 y N.º5", why: "Rutina básica para un cabello suelto y con brillo." }],
    avoid: ["Plancha diaria sin protector"],
  },
];

export const careFor = (f: string) => care.find((c) => c.family === f);

/** Servicio de la agenda → familia de cuidado. */
export const serviceFamily: Record<string, Family> = {
  Balayage: "balayage",
  "Rubio o decoloración": "rubios",
  Cobrizo: "cobrizos",
  "Corrección de color": "rubios",
  Corte: "cortes",
};
