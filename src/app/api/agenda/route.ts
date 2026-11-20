import { after, connection } from "next/server";
import { site } from "@/data/site";
import { careFor, serviceFamily } from "@/data/care";
import { agenda, hairStates, services } from "@/lib/agenda/config";
import { buildDays, endOf, isValidStart, range } from "@/lib/agenda/slots";
import { busyBetween, calendarEnabled, createEvent, driveEnabled, uploadToDrive } from "@/lib/agenda/google";
import { formatSlot, normalizePhone, type Booking } from "@/lib/agenda/format";
import { emailDiana, emailEnabled, sendEmail, sendWhatsAppTemplate } from "@/lib/notify";
import { str, tooMany } from "@/lib/agenda/guard";

/**
 * GET  /api/agenda → turnos libres y qué está conectado (calendar, fotos).
 * POST /api/agenda → reserva un diagnóstico (multipart: campos + fotos opcionales).
 *
 * Sin credenciales de Google (ver AGENDA.md) funciona en modo «solicitud»:
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
      { mode, photos: driveEnabled(), duration: agenda.duration, days: buildDays(now, busy) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    console.error("[agenda] GET", err);
    return Response.json({ error: "No pudimos leer la agenda. Escríbenos por WhatsApp." }, { status: 502 });
  }
}

/* ---------------------------------------------------------------- reservar */

const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_PHOTO = 4 * 1024 * 1024;

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (tooMany(`agenda:${ip}`, 5)) return Response.json({ error: "Demasiados intentos. Espera unos minutos." }, { status: 429 });

  let fd: FormData;
  try {
    fd = await req.formData();
  } catch {
    return Response.json({ error: "Solicitud inválida." }, { status: 400 });
  }
  const get = (k: string, max: number) => str(fd.get(k), max);

  // Campo trampa: los humanos no lo ven; los bots lo llenan.
  if (get("empresa", 100)) return Response.json({ ok: true, calendar: false });

  const b: Booking = {
    start: get("start", 40),
    name: get("name", 80),
    phone: get("phone", 30),
    email: get("email", 120) || undefined,
    service: get("service", 60),
    hair: get("hair", 60),
    notes: get("notes", 900) || undefined,
  };
  const photos = (["foto_actual", "foto_referencia"] as const)
    .map((k) => ({ k, f: fd.get(k) }))
    .filter((p): p is { k: (typeof p)["k"]; f: File } => p.f instanceof File && p.f.size > 0);

  const errors: Record<string, string> = {};
  if (b.name.length < 2) errors.name = "Escribe tu nombre.";
  const phone = normalizePhone(b.phone);
  if (!phone) errors.phone = "Revisa tu número de WhatsApp.";
  if (b.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(b.email)) errors.email = "Revisa tu correo.";
  if (!(services as readonly string[]).includes(b.service)) errors.service = "Elige qué te quieres hacer.";
  if (!(hairStates as readonly string[]).includes(b.hair)) errors.hair = "Cuéntanos cómo está tu cabello.";
  if (fd.get("consent") !== "true") errors.consent = "Necesitamos tu autorización para agendar.";
  if (photos.some(({ f }) => !PHOTO_TYPES.includes(f.type) || f.size > MAX_PHOTO)) errors.photos = "Las fotos deben ser JPG, PNG o WebP de menos de 4 MB.";
  const now = Date.now();
  if (!isValidStart(b.start, now)) errors.start = "Ese horario ya no está disponible. Elige otro.";
  if (Object.keys(errors).length) return Response.json({ errors }, { status: 422 });

  const end = endOf(b.start);
  if (!calendarEnabled()) return Response.json({ ok: true, calendar: false, photos: false, start: b.start, end });

  try {
    // Se vuelve a mirar justo antes de crear: alguien pudo tomar el turno mientras tanto.
    const busy = await busyBetween(new Date(b.start).toISOString(), new Date(end).toISOString());
    if (busy.length) {
      return Response.json({ errors: { start: "Alguien acaba de tomar ese horario. Elige otro." } }, { status: 409 });
    }

    // Fotos → Drive de Diana. Si falla, la cita sigue: las puede mandar por WhatsApp.
    const links: string[] = [];
    if (photos.length && driveEnabled()) {
      const day = b.start.slice(0, 10);
      for (const { k, f } of photos) {
        try {
          const label = k === "foto_actual" ? "cabello-hoy" : "referencia";
          const ext = f.type.split("/")[1].replace("jpeg", "jpg");
          const link = await uploadToDrive(`${day} ${b.name} - ${label}.${ext}`, f.type, await f.arrayBuffer());
          links.push(`${k === "foto_actual" ? "Cabello hoy" : "Referencia"}: ${link}`);
        } catch (err) {
          console.error("[agenda] Drive", err);
        }
      }
    }

    const when = formatSlot(b.start);
    await createEvent({
      summary: `Diagnóstico · ${b.name}`,
      start: b.start,
      end,
      meta: {
        origen: "web-diagnostico",
        nombre: b.name,
        telefono: phone!,
        ...(b.email ? { email: b.email } : {}),
        servicio: b.service,
        cabello: b.hair,
      },
      description: [
        `Cita de diagnóstico agendada desde la web.`,
        ``,
        `Clienta: ${b.name}`,
        `WhatsApp: +${phone} → https://wa.me/${phone}`,
        b.email ? `Correo: ${b.email}` : "",
        `Quiere: ${b.service}`,
        `Cabello hoy: ${b.hair}`,
        b.notes ? `Notas: ${b.notes}` : "",
        ...(links.length ? ["", "Fotos:", ...links] : []),
        ``,
        `Fecha: ${when} (hora de Colombia)`,
        `Autorizó el tratamiento de sus datos (Ley 1581 de 2012) el ${new Date(now).toISOString()}.`,
      ]
        .filter((l, i, a) => l !== "" || a[i - 1] !== "")
        .join("\n"),
    });

    // Avisos: después de responder, para que la clienta no espere.
    after(async () => {
      const first = b.name.split(" ")[0];
      const fam = careFor(serviceFamily[b.service] ?? "");
      const tasks: Promise<unknown>[] = [
        emailDiana(
          `Nueva cita: ${b.name} · ${when}`,
          `${b.name} agendó un diagnóstico para el ${when}.\nQuiere: ${b.service}. Cabello hoy: ${b.hair}.\nWhatsApp: https://wa.me/${phone}${b.notes ? `\nNotas: ${b.notes}` : ""}${links.length ? `\n\n${links.join("\n")}` : ""}`,
        ),
        sendWhatsAppTemplate(phone!, "WHATSAPP_TEMPLATE_CONFIRMACION", [first, when]),
      ];
      if (b.email && emailEnabled()) {
        tasks.push(
          sendEmail(
            b.email,
            `Tu diagnóstico con Diana Melo · ${when}`,
            [
              `Hola ${first},`,
              ``,
              `Tu cita de diagnóstico quedó agendada para el ${when} (hora de Colombia), en ${site.address || site.city}.`,
              `Dura unos ${agenda.duration} minutos: Diana mira tu cabello y te arma un plan de color.`,
              ``,
              `Si necesitas cambiarla, escríbele por WhatsApp: https://wa.me/${site.whatsapp.number}`,
              fam ? `\nMientras tanto, así se cuida un color como el que quieres: ${site.url}/cuidado/${fam.family}` : "",
              ``,
              `Diana Melo`,
            ].join("\n"),
          ),
        );
      }
      const results = await Promise.allSettled(tasks);
      results.forEach((r) => r.status === "rejected" && console.error("[agenda] aviso", r.reason));
    });

    return Response.json({ ok: true, calendar: true, photos: links.length > 0, start: b.start, end });
  } catch (err) {
    console.error("[agenda] POST", err);
    return Response.json(
      { error: "No pudimos guardar la cita en la agenda. Envíanos la solicitud por WhatsApp.", fallback: true },
      { status: 502 },
    );
  }
}
