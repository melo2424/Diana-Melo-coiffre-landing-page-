import { createSign } from "node:crypto";
import { agenda } from "./config";
import type { Busy } from "./slots";

/**
 * Cliente mínimo de Google Calendar con una cuenta de servicio (sin dependencias).
 * Diana comparte su calendario con el correo de la cuenta de servicio con permiso
 * «Hacer cambios en eventos». Variables: ver .env.example.
 */

const SCOPE = "https://www.googleapis.com/auth/calendar";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const API = "https://www.googleapis.com/calendar/v3";

function credentials() {
  const email = process.env.GOOGLE_CLIENT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  return email && key && calendarId ? { email, key, calendarId } : null;
}

export const calendarEnabled = () => credentials() !== null;

const b64url = (s: string | Buffer) => Buffer.from(s).toString("base64url");

let cached: { token: string; exp: number } | null = null;

async function accessToken() {
  const c = credentials();
  if (!c) throw new Error("Google Calendar no está configurado");
  const now = Math.floor(Date.now() / 1000);
  if (cached && cached.exp - 60 > now) return cached.token;

  const head = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const body = b64url(JSON.stringify({ iss: c.email, scope: SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600 }));
  const signature = createSign("RSA-SHA256").update(`${head}.${body}`).sign(c.key, "base64url");

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${head}.${body}.${signature}`,
    }),
  });
  if (!res.ok) throw new Error(`Google token ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cached = { token: json.access_token, exp: now + json.expires_in };
  return cached.token;
}

async function call<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${await accessToken()}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Google Calendar ${res.status}: ${await res.text()}`);
  return (await res.json()) as T;
}

/** Bloques ocupados del calendario de Diana en la ventana dada. */
export async function busyBetween(timeMin: string, timeMax: string): Promise<Busy[]> {
  const { calendarId } = credentials()!;
  const json = await call<{ calendars: Record<string, { busy: Busy[]; errors?: unknown[] }> }>("/freeBusy", {
    timeMin,
    timeMax,
    timeZone: agenda.timeZone,
    items: [{ id: calendarId }],
  });
  const cal = json.calendars[calendarId];
  if (cal?.errors?.length) throw new Error(`Google Calendar freeBusy: ${JSON.stringify(cal.errors)}`);
  return cal?.busy ?? [];
}

export async function createEvent(e: { summary: string; description: string; start: string; end: string }) {
  const { calendarId } = credentials()!;
  return call<{ id: string; htmlLink: string }>(`/calendars/${encodeURIComponent(calendarId)}/events`, {
    summary: e.summary,
    description: e.description,
    start: { dateTime: e.start, timeZone: agenda.timeZone },
    end: { dateTime: e.end, timeZone: agenda.timeZone },
    colorId: "5", // amarillo «banana»: se distingue de lo que Diana agenda a mano
    reminders: { useDefault: false, overrides: [{ method: "popup", minutes: 60 }] },
    extendedProperties: { private: { origen: "web-diagnostico" } },
  });
}
