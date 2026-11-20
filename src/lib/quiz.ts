import type { Family } from "@/data/images";

/**
 * Mini diagnóstico: cinco preguntas y una recomendación orientativa.
 * No reemplaza la cita: le da a Diana el contexto y a la clienta un punto de partida.
 * POR CONFIRMAR con Diana: las reglas y los textos de cada resultado.
 */

export type Answers = {
  hair?: "Natural" | "Teñido" | "Decolorado" | "Con alisado o keratina";
  history?: string[];
  goal?: "aclarar" | "luz" | "intenso" | "corregir" | "corte";
  depth?: "negro" | "castano-oscuro" | "castano-claro" | "rubio-oscuro" | "rubio-claro";
  upkeep?: "mensual" | "trimestral" | "minimo";
};

export const questions = [
  {
    key: "hair",
    title: "¿Cómo está tu cabello hoy?",
    options: [
      { value: "Natural", label: "Natural", hint: "Nunca teñido o hace mucho" },
      { value: "Teñido", label: "Teñido", hint: "Tinte de salón o de caja" },
      { value: "Decolorado", label: "Decolorado", hint: "Rubio o mechas aclaradas" },
      { value: "Con alisado o keratina", label: "Con alisado", hint: "Keratina, progresivo o similar" },
    ],
  },
  {
    key: "history",
    multi: true,
    title: "¿Qué te has hecho en el último año?",
    options: [
      { value: "Nada", label: "Nada" },
      { value: "Tinte en casa", label: "Tinte en casa" },
      { value: "Decoloración", label: "Decoloración" },
      { value: "Mechas o balayage", label: "Mechas o balayage" },
      { value: "Alisado o keratina", label: "Alisado o keratina" },
    ],
  },
  {
    key: "goal",
    title: "¿Qué quieres lograr?",
    options: [
      { value: "aclarar", label: "Aclarar", hint: "Ir hacia el rubio" },
      { value: "luz", label: "Luz natural", hint: "Como si fuera el sol" },
      { value: "intenso", label: "Color intenso", hint: "Cobres y cálidos" },
      { value: "corregir", label: "Corregir", hint: "Un color que no salió bien" },
      { value: "corte", label: "Cambiar el corte", hint: "Forma y movimiento" },
    ],
  },
  {
    key: "depth",
    title: "¿Qué tan oscuro es tu color de base?",
    options: [
      { value: "negro", label: "Negro", swatch: "#1c1714" },
      { value: "castano-oscuro", label: "Castaño oscuro", swatch: "#3b2a20" },
      { value: "castano-claro", label: "Castaño claro", swatch: "#6b4a33" },
      { value: "rubio-oscuro", label: "Rubio oscuro", swatch: "#9a7650" },
      { value: "rubio-claro", label: "Rubio claro", swatch: "#d6c09a" },
    ],
  },
  {
    key: "upkeep",
    title: "¿Cada cuánto puedes volver al salón?",
    options: [
      { value: "mensual", label: "Cada mes" },
      { value: "trimestral", label: "Cada 2 o 3 meses" },
      { value: "minimo", label: "Lo menos posible" },
    ],
  },
] as const;

export type Result = {
  family: Family;
  service: string;
  title: string;
  text: string;
  tones: string[];
  notes: string[];
};

const dark = (d?: Answers["depth"]) => d === "negro" || d === "castano-oscuro";

export function recommend(a: Answers): Result {
  const notes: string[] = [];
  const chemical = a.hair === "Decolorado" || a.hair === "Con alisado o keratina" || a.history?.includes("Decoloración") || a.history?.includes("Alisado o keratina");
  if (chemical && (a.goal === "aclarar" || a.goal === "luz")) {
    notes.push("Como tu cabello ya tiene química, Diana revisará primero la fibra antes de aclarar más.");
  }
  if (a.history?.includes("Tinte en casa")) {
    notes.push("El tinte de caja suele acumularse en medios y puntas: en el diagnóstico Diana mira cuánto hay que retirar.");
  }

  if (a.goal === "corregir") {
    return {
      family: dark(a.depth) ? "balayage" : "rubios",
      service: "Corrección de color",
      title: "Corrección de color",
      text: "Primero hay que entender qué pasó con tu color. En el diagnóstico Diana mira tu cabello de cerca y te propone un plan, a veces en más de una sesión.",
      tones: dark(a.depth) ? ["Chocolate", "Caramelo", "Miel"] : ["Arena", "Beige", "Champaña"],
      notes,
    };
  }
  if (a.goal === "corte") {
    return {
      family: "cortes",
      service: "Corte",
      title: "Un corte pensado para ti",
      text: "Forma, largo y movimiento según tu tipo de cabello y cómo te peinas en el día a día.",
      tones: [],
      notes,
    };
  }
  if (a.goal === "intenso") {
    return {
      family: "cobrizos",
      service: "Cobrizo",
      title: "Cobrizo con brillo",
      text: "Los cobres dan mucho brillo y van bien con casi cualquier base. Piden lavar con agua fría para que duren.",
      tones: dark(a.depth) ? ["Cobre", "Caramelo", "Chocolate"] : ["Cobre", "Caramelo", "Miel"],
      notes,
    };
  }
  if (a.goal === "aclarar" && a.upkeep !== "minimo" && !dark(a.depth)) {
    return {
      family: "rubios",
      service: "Rubio o decoloración",
      title: "Rubio luminoso",
      text: "Con tu base, un rubio parejo es posible. Necesita retoque de raíz cada 6 a 8 semanas y matizar en casa.",
      tones: ["Champaña", "Perla", "Beige"],
      notes,
    };
  }
  if (a.goal === "aclarar" && dark(a.depth)) {
    notes.push("Desde una base oscura, el rubio se construye por etapas para cuidar el cabello.");
  }
  if (a.upkeep === "minimo") notes.push("El balayage crece sin raya marcada: es lo que menos mantenimiento pide.");
  return {
    family: "balayage",
    service: "Balayage",
    title: "Balayage a tu medida",
    text: "Luz pintada a mano sobre tu base: se ve natural, crece sin raya y aguanta de 3 a 4 meses entre citas.",
    tones: dark(a.depth) ? ["Caramelo", "Miel", "Dorado"] : ["Miel", "Dorado", "Arena"],
    notes,
  };
}

/** Resumen para las notas de la agenda (lo lee Diana en el evento). */
export function summary(a: Answers, r: Result) {
  const label = (key: string, v?: string) =>
    questions.find((q) => q.key === key)?.options.find((o) => o.value === v)?.label ?? v ?? "";
  return [
    `Mini diagnóstico web → ${r.title}${r.tones.length ? ` (${r.tones.join(", ")})` : ""}.`,
    a.history?.length ? `Último año: ${a.history.join(", ")}.` : "",
    a.depth ? `Base: ${label("depth", a.depth).toLowerCase()}.` : "",
    a.upkeep ? `Puede volver: ${label("upkeep", a.upkeep).toLowerCase()}.` : "",
  ]
    .filter(Boolean)
    .join(" ");
}
