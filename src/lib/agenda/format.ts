import { agenda } from "./config";

/** Datos de una reserva, tal como viajan del formulario al servidor. */
export type Booking = {
  start: string;
  name: string;
  phone: string;
  email?: string;
  service: string;
  hair: string;
  notes?: string;
};

const dayFmt = new Intl.DateTimeFormat("es-CO", {
  timeZone: agenda.timeZone,
  weekday: "long",
  day: "numeric",
  month: "long",
});
const timeFmt = new Intl.DateTimeFormat("es-CO", { timeZone: agenda.timeZone, hour: "numeric", minute: "2-digit" });

/** "sábado 22 de noviembre" */
export const formatDay = (iso: string) => dayFmt.format(new Date(iso)).replace(",", "");
/** "9:30 a. m." */
export const formatTime = (iso: string) => timeFmt.format(new Date(iso));
/** Cierra una frase sin duplicar el punto de «a. m.». */
export const period = (s: string) => (s.endsWith(".") ? s : `${s}.`);
/** "sábado 22 de noviembre a las 9:30 a. m." */
export const formatSlot = (iso: string) => `${formatDay(iso)} a las ${formatTime(iso)}`;

/** Celular colombiano a formato internacional sin «+»: "315 259 3815" → "573152593815". */
export function normalizePhone(raw: string) {
  const d = raw.replace(/\D/g, "");
  if (d.length === 10 && d.startsWith("3")) return `57${d}`;
  if (d.length === 12 && d.startsWith("573")) return d;
  if (d.length >= 8 && d.length <= 15) return d; // número extranjero ya con indicativo
  return null;
}

/** Mensaje que la clienta le envía a Diana por WhatsApp al terminar. */
export function confirmationMessage(b: Booking, inCalendar: boolean) {
  return [
    `Hola Diana, soy ${b.name}.`,
    inCalendar
      ? period(`Acabo de agendar mi cita de diagnóstico en tu web para el ${formatSlot(b.start)}`)
      : `${period(`Quiero agendar una cita de diagnóstico para el ${formatSlot(b.start)}`)} ¿Me la confirmas?`,
    `Me interesa: ${b.service}. Mi cabello hoy: ${b.hair}.`,
    b.notes ? `Te cuento: ${b.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

/** Enlace para que la clienta guarde la cita en su propio Google Calendar. */
export function addToCalendarLink(b: Booking, end: string, location: string) {
  const z = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const q = new URLSearchParams({
    action: "TEMPLATE",
    text: "Diagnóstico de color con Diana Melo",
    dates: `${z(b.start)}/${z(end)}`,
    details: "Cita de diagnóstico: Diana revisa tu cabello y arma tu plan de color.",
    location,
    ctz: agenda.timeZone,
  });
  return `https://calendar.google.com/calendar/render?${q}`;
}

/** Recordatorio de retoque para el calendario de la clienta, `weeks` semanas después de `fromIso`. */
export function retouchLink(fromIso: string, weeks: number, what: string, bookingUrl: string) {
  const t = Date.parse(fromIso) + weeks * 7 * 24 * 3600_000;
  const day = new Date(t + -5 * 3600_000).toISOString().slice(0, 10).replace(/-/g, "");
  const next = new Date(t + 19 * 3600_000).toISOString().slice(0, 10).replace(/-/g, ""); // día siguiente (evento de día completo)
  const q = new URLSearchParams({
    action: "TEMPLATE",
    text: `Retoque con Diana Melo: ${what}`,
    dates: `${day}/${next}`,
    details: `Ya van ${weeks} semanas desde tu color. Agenda tu retoque: ${bookingUrl}`,
    ctz: agenda.timeZone,
  });
  return `https://calendar.google.com/calendar/render?${q}`;
}
