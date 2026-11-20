import { connection } from "next/server";
import { site } from "@/data/site";
import { agenda, hairStates, services } from "@/lib/agenda/config";
import { buildDays, endOf, isValidStart, range } from "@/lib/agenda/slots";
import { busyBetween, calendarEnabled, createEvent } from "@/lib/agenda/google";
import { formatSlot, normalizePhone, type Booking } from "@/lib/agenda/format";

/**
 * GET  /api/agenda → turnos libres de los próximos días.
 * POST /api/agenda → reserva un diagnóstico y lo crea en el Google Calendar de Diana.
 *
 * Sin credenciales de Google (ver .env.example) funciona en modo «solicitud»:
 * muestra el horario base y la reserva se confirma por WhatsApp.
 */

export async function GET() {
  await connection(); // siempre en tiempo real: la disponibilidad cambia
  const now = Date.now();
  const mode = calendarEnabled() ? "calendar" : "solicitud";
  try {
    const { timeMin, timeMax } = range(now);
    const busy = mode === "calendar" ? await busyBetween(timeMin, timeMax) : [];
    return Response.json(
      { mode, duration: agenda.duration, days: buildDays(now, busy) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    console.error("[agenda] GET", err);
    return Response.json({ error: "No pudimos leer la agenda. Escríbenos por WhatsApp." }, { status: 502 });
  }
}

/* ---------------------------------------------------------------- reservar */

// Freno sencillo contra envíos repetidos: 5 reservas por IP cada 10 minutos (memoria del proceso).
const hits = new Map<string, number[]>();
function tooMany(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (tooMany(ip)) return Response.json({ error: "Demasiados intentos. Espera unos minutos." }, { status: 429 });

  let raw: Record<string, unknown>;
  try {
    raw = await req.json();
  } catch {
    return Response.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  // Campo trampa: los humanos no lo ven; los bots lo llenan.
  if (str(raw.empresa, 100)) return Response.json({ ok: true, calendar: false });

  const b: Booking = {
    start: str(raw.start, 40),
    name: str(raw.name, 80),
    phone: str(raw.phone, 30),
    email: str(raw.email, 120) || undefined,
    service: str(raw.service, 60),
    hair: str(raw.hair, 60),
    notes: str(raw.notes, 600) || undefined,
  };

  const errors: Record<string, string> = {};
  if (b.name.length < 2) errors.name = "Escribe tu nombre.";
  const phone = normalizePhone(b.phone);
  if (!phone) errors.phone = "Revisa tu número de WhatsApp.";
  if (b.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(b.email)) errors.email = "Revisa tu correo.";
  if (!(services as readonly string[]).includes(b.service)) errors.service = "Elige qué te quieres hacer.";
  if (!(hairStates as readonly string[]).includes(b.hair)) errors.hair = "Cuéntanos cómo está tu cabello.";
  if (raw.consent !== true) errors.consent = "Necesitamos tu autorización para agendar.";
  const now = Date.now();
  if (!isValidStart(b.start, now)) errors.start = "Ese horario ya no está disponible. Elige otro.";
  if (Object.keys(errors).length) return Response.json({ errors }, { status: 422 });

  const end = endOf(b.start);

  if (!calendarEnabled()) return Response.json({ ok: true, calendar: false, start: b.start, end });

  try {
    // Se vuelve a mirar justo antes de crear: alguien pudo tomar el turno mientras tanto.
    const busy = await busyBetween(new Date(b.start).toISOString(), new Date(end).toISOString());
    if (busy.length) {
      return Response.json({ errors: { start: "Alguien acaba de tomar ese horario. Elige otro." } }, { status: 409 });
    }

    await createEvent({
      summary: `Diagnóstico · ${b.name}`,
      start: b.start,
      end,
      description: [
        `Cita de diagnóstico agendada desde la web.`,
        ``,
        `Clienta: ${b.name}`,
        `WhatsApp: +${phone} → https://wa.me/${phone}`,
        b.email ? `Correo: ${b.email}` : "",
        `Quiere: ${b.service}`,
        `Cabello hoy: ${b.hair}`,
        b.notes ? `Notas: ${b.notes}` : "",
        ``,
        `Fecha: ${formatSlot(b.start)} (hora de Colombia)`,
        `Autorizó el tratamiento de sus datos (Ley 1581 de 2012) el ${new Date(now).toISOString()}.`,
        `Sitio: ${site.name}`,
      ]
        .filter((l) => l !== "")
        .join("\n"),
    });
    return Response.json({ ok: true, calendar: true, start: b.start, end });
  } catch (err) {
    console.error("[agenda] POST", err);
    return Response.json(
      { error: "No pudimos guardar la cita en la agenda. Envíanos la solicitud por WhatsApp.", fallback: true },
      { status: 502 },
    );
  }
}
