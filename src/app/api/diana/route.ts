import { cookies } from "next/headers";
import { PANEL_COOKIE, checkPassword, isPanelAuthed, panelToken } from "@/lib/panel-auth";
import { patchEvent } from "@/lib/agenda/google";
import { str, tooMany } from "@/lib/agenda/guard";

/**
 * POST /api/diana  { action: "login", password } | { action: "logout" }
 *                  { action: "asistencia", id, estado: "llego" | "no-llego" }
 */
export async function POST(req: Request) {
  let raw: Record<string, unknown>;
  try {
    raw = await req.json();
  } catch {
    return Response.json({ error: "Solicitud inválida." }, { status: 400 });
  }
  const jar = await cookies();

  if (raw.action === "login") {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
    if (tooMany(`login:${ip}`, 8)) return Response.json({ error: "Demasiados intentos. Espera unos minutos." }, { status: 429 });
    if (!checkPassword(str(raw.password, 200))) return Response.json({ error: "Contraseña incorrecta." }, { status: 401 });
    jar.set(PANEL_COOKIE, panelToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return Response.json({ ok: true });
  }

  if (raw.action === "logout") {
    jar.delete(PANEL_COOKIE);
    return Response.json({ ok: true });
  }

  if (!(await isPanelAuthed())) return Response.json({ error: "No autorizado." }, { status: 401 });

  if (raw.action === "asistencia") {
    const id = str(raw.id, 200);
    const estado = raw.estado === "llego" || raw.estado === "no-llego" ? raw.estado : null;
    if (!id || !estado) return Response.json({ error: "Datos incompletos." }, { status: 400 });
    try {
      // verde = llegó, rojo = no llegó (colores de Google Calendar)
      await patchEvent(id, { asistencia: estado }, estado === "llego" ? "10" : "11");
      return Response.json({ ok: true });
    } catch (err) {
      console.error("[panel] asistencia", err);
      return Response.json({ error: "No se pudo actualizar el evento." }, { status: 502 });
    }
  }

  return Response.json({ error: "Acción desconocida." }, { status: 400 });
}
