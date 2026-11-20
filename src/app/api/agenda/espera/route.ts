import { after } from "next/server";
import { calendarEnabled, createEvent } from "@/lib/agenda/google";
import { normalizePhone } from "@/lib/agenda/format";
import { localDate } from "@/lib/agenda/slots";
import { str, tooMany } from "@/lib/agenda/guard";
import { emailDiana } from "@/lib/notify";

/**
 * POST /api/agenda/espera → «avísame si se libera un turno».
 * Con Google conectado queda como evento de día completo, gris y «libre» (no bloquea la agenda),
 * y aparece en el panel de Diana. Sin Google, la clienta lo envía por WhatsApp.
 */
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (tooMany(`espera:${ip}`, 3)) return Response.json({ error: "Demasiados intentos. Espera unos minutos." }, { status: 429 });

  let raw: Record<string, unknown>;
  try {
    raw = await req.json();
  } catch {
    return Response.json({ error: "Solicitud inválida." }, { status: 400 });
  }
  if (str(raw.empresa, 100)) return Response.json({ ok: true, calendar: false });

  const name = str(raw.name, 80);
  const phone = normalizePhone(str(raw.phone, 30));
  const when = str(raw.when, 200);
  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = "Escribe tu nombre.";
  if (!phone) errors.phone = "Revisa tu número de WhatsApp.";
  if (raw.consent !== true) errors.consent = "Necesitamos tu autorización.";
  if (Object.keys(errors).length) return Response.json({ errors }, { status: 422 });

  if (!calendarEnabled()) return Response.json({ ok: true, calendar: false });

  try {
    const today = localDate(Date.now());
    await createEvent({
      allDay: true,
      start: today,
      end: localDate(Date.now() + 86_400_000),
      summary: `Lista de espera · ${name}`,
      description: `${name} quiere un turno si se libera.\nPrefiere: ${when || "cualquier día"}\nWhatsApp: https://wa.me/${phone}`,
      meta: { origen: "web-espera", nombre: name, telefono: phone!, servicio: when || "cualquier día" },
    });
    after(() => emailDiana(`Lista de espera: ${name}`, `${name} quiere un turno si se libera.\nPrefiere: ${when || "cualquier día"}\nhttps://wa.me/${phone}`).catch(console.error));
    return Response.json({ ok: true, calendar: true });
  } catch (err) {
    console.error("[espera]", err);
    return Response.json({ error: "No pudimos guardarte en la lista. Escríbenos por WhatsApp.", fallback: true }, { status: 502 });
  }
}
