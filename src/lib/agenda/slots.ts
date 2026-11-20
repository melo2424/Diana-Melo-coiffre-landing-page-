import { agenda } from "./config";

export type Busy = { start: string; end: string };
export type Day = { date: string; slots: string[] };

const MIN = 60_000;
const DAY = 24 * 60 * MIN;
/** Desfase de Colombia en milisegundos (UTC−5). */
const OFFSET_MS = -5 * 60 * MIN;

/** "YYYY-MM-DD" del día en Colombia para un instante dado. */
export function localDate(t: number) {
  return new Date(t + OFFSET_MS).toISOString().slice(0, 10);
}

/** Instante de una hora local de Colombia ("2026-11-21", "09:30"). */
function at(date: string, hhmm: string) {
  return new Date(`${date}T${hhmm}:00${agenda.offset}`).getTime();
}

/** ISO con el desfase de Colombia, p. ej. "2026-11-21T09:30:00-05:00". */
export function toLocalIso(t: number) {
  return new Date(t + OFFSET_MS).toISOString().slice(0, 19) + agenda.offset;
}

/** Ventana completa que cubre la agenda, para pedirle a Google los ocupados de una vez. */
export function range(now: number) {
  const first = localDate(now);
  const last = localDate(now + agenda.horizonDays * DAY);
  return { timeMin: new Date(at(first, "00:00")).toISOString(), timeMax: new Date(at(last, "23:59")).toISOString() };
}

/** Todos los turnos libres desde ahora hasta el horizonte, agrupados por día. */
export function buildDays(now: number, busy: Busy[] = []): Day[] {
  const blocks = busy.map((b) => [Date.parse(b.start), Date.parse(b.end)] as const);
  const earliest = now + agenda.minNoticeHours * 60 * MIN;
  const days: Day[] = [];

  for (let d = 0; d <= agenda.horizonDays; d++) {
    const date = localDate(now + d * DAY);
    const weekday = new Date(`${date}T12:00:00${agenda.offset}`).getUTCDay();
    const slots: string[] = [];
    for (const [from, to] of agenda.hours[weekday] ?? []) {
      const end = at(date, to);
      for (let t = at(date, from); t + agenda.duration * MIN <= end; t += agenda.step * MIN) {
        const tEnd = t + agenda.duration * MIN;
        if (t < earliest) continue;
        if (blocks.some(([bs, be]) => t < be && tEnd > bs)) continue;
        slots.push(toLocalIso(t));
      }
    }
    if ((agenda.hours[weekday] ?? []).length) days.push({ date, slots });
  }
  return days;
}

/** ¿Este inicio es un turno válido de la agenda (horario, anticipación, horizonte)? */
export function isValidStart(iso: string, now: number) {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return false;
  return buildDays(now).some((d) => d.slots.some((s) => Date.parse(s) === t));
}

export function endOf(iso: string) {
  return toLocalIso(Date.parse(iso) + agenda.duration * MIN);
}
