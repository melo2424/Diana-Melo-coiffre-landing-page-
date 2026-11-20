/**
 * Reglas de la agenda de diagnósticos.
 * POR CONFIRMAR con Diana: horario, duración y anticipación.
 */
export const agenda = {
  /** Zona horaria del estudio. Colombia no tiene horario de verano: siempre UTC−5. */
  timeZone: "America/Bogota",
  offset: "-05:00",
  /** Duración de la cita de diagnóstico, en minutos. */
  duration: 30,
  /** Cada cuánto empieza un turno, en minutos. */
  step: 30,
  /** Horas mínimas entre ahora y la cita. */
  minNoticeHours: 3,
  /** Días hacia adelante que se pueden reservar. */
  horizonDays: 21,
  /** Horario por día de la semana (0 = domingo). Tramos [inicio, fin) en hora de Colombia. */
  hours: {
    0: [],
    1: [["09:00", "18:00"]],
    2: [["09:00", "18:00"]],
    3: [["09:00", "18:00"]],
    4: [["09:00", "18:00"]],
    5: [["09:00", "18:00"]],
    6: [["09:00", "14:00"]],
  } as Record<number, [string, string][]>,
} as const;

/** Lo que la clienta quiere hacerse. */
export const services = [
  "Balayage",
  "Rubio o decoloración",
  "Cobrizo",
  "Corrección de color",
  "Corte",
  "Peinado o maquillaje",
  "Aún no sé",
] as const;

/** Cómo está su cabello hoy: es lo primero que Diana necesita saber. */
export const hairStates = ["Natural", "Teñido", "Decolorado", "Con alisado o keratina"] as const;

export type Service = (typeof services)[number];
export type HairState = (typeof hairStates)[number];
