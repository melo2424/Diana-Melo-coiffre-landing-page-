import { connection } from "next/server";
import { site } from "@/data/site";
import { calendarEnabled, listEvents, patchEvent } from "@/lib/agenda/google";
import { formatSlot } from "@/lib/agenda/format";
import { localDate } from "@/lib/agenda/slots";
import { agenda } from "@/lib/agenda/config";
import { sendEmail, sendWhatsAppTemplate } from "@/lib/notify";

/**
 * GET /api/cron/recordatorios: se ejecuta una vez al día (vercel.json → 9:00 a. m. de Colombia).
 * Avisa a las clientas que tienen diagnóstico MAÑANA, por correo y/o WhatsApp automático,
 * y marca el evento como «recordado» para no repetir.
 * Protegido con CRON_SECRET (Vercel lo envía como «Authorization: Bearer …»).
 */
export async function GET(req: Request) {
  await connection();
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!calendarEnabled()) return Response.json({ ok: true, skipped: "Google Calendar no está configurado" });

  const tomorrow = localDate(Date.now() + 86_400_000);
  const from = new Date(`${tomorrow}T00:00:00${agenda.offset}`).toISOString();
  const to = new Date(`${tomorrow}T23:59:59${agenda.offset}`).toISOString();
  const events = await listEvents(from, to, "web-diagnostico");

  const report: { id: string; email: boolean; whatsapp: boolean; error?: string }[] = [];
  for (const ev of events) {
    const m = ev.extendedProperties?.private ?? {};
    if (m.recordado === "1" || !ev.start.dateTime) continue;
    const first = (m.nombre ?? "").split(" ")[0] || "hola";
    const when = formatSlot(ev.start.dateTime);
    const row = { id: ev.id, email: false, whatsapp: false } as (typeof report)[number];
    try {
      if (m.email) {
        row.email = await sendEmail(
          m.email,
          `Mañana es tu diagnóstico con Diana Melo`,
          [
            `Hola ${first},`,
            ``,
            `Te recordamos tu cita de diagnóstico: ${when} (hora de Colombia), en ${site.address || site.city}.`,
            `Si tienes fotos de colores que te gustan, tráelas.`,
            ``,
            `¿Necesitas cambiarla? Escríbele a Diana: https://wa.me/${site.whatsapp.number}`,
          ].join("\n"),
        );
      }
      if (m.telefono) row.whatsapp = await sendWhatsAppTemplate(m.telefono, "WHATSAPP_TEMPLATE_RECORDATORIO", [first, when]);
      if (row.email || row.whatsapp) await patchEvent(ev.id, { recordado: "1" });
    } catch (err) {
      row.error = String(err);
      console.error("[recordatorios]", err);
    }
    report.push(row);
  }
  return Response.json({ ok: true, day: tomorrow, sent: report });
}
