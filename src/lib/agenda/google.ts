import { createSign } from "node:crypto";
import { agenda } from "./config";
import type { Busy } from "./slots";

/**
 * Cliente mínimo de Google (Calendar + Drive), sin dependencias.
 *
 * Dos formas de autenticarse (ver AGENDA.md):
 *  - OAuth con la cuenta de Diana (recomendada): GOOGLE_OAUTH_CLIENT_ID / _SECRET / _REFRESH_TOKEN.
 *    Sirve para Calendar y para subir las fotos a su Drive.
 *  - Cuenta de servicio: GOOGLE_CLIENT_EMAIL / GOOGLE_PRIVATE_KEY. Sirve para Calendar;
 *    para Drive solo funciona con una unidad compartida de Google Workspace.
 */

const SCOPES = "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/drive.file";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const CAL = "https://www.googleapis.com/calendar/v3";

const env = (k: string) => process.env[k]?.trim() || undefined;

function auth() {
  const id = env("GOOGLE_OAUTH_CLIENT_ID");
  const secret = env("GOOGLE_OAUTH_CLIENT_SECRET");
  const refresh = env("GOOGLE_OAUTH_REFRESH_TOKEN");
  if (id && secret && refresh) return { kind: "oauth" as const, id, secret, refresh };
  const email = env("GOOGLE_CLIENT_EMAIL");
  const key = env("GOOGLE_PRIVATE_KEY")?.replace(/\\n/g, "\n");
  if (email && key) return { kind: "service" as const, email, key };
  return null;
}

const calendarId = () => env("GOOGLE_CALENDAR_ID");
const folderId = () => env("GOOGLE_DRIVE_FOLDER_ID");

export const calendarEnabled = () => auth() !== null && !!calendarId();
export const driveEnabled = () => auth() !== null && !!folderId();

const b64url = (s: string | Buffer) => Buffer.from(s).toString("base64url");
let cached: { token: string; exp: number } | null = null;

async function accessToken() {
  const a = auth();
  if (!a) throw new Error("Google no está configurado");
  const now = Math.floor(Date.now() / 1000);
  if (cached && cached.exp - 60 > now) return cached.token;

  let body: URLSearchParams;
  if (a.kind === "oauth") {
    body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: a.refresh,
      client_id: a.id,
      client_secret: a.secret,
    });
  } else {
    const head = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
    const claims = b64url(JSON.stringify({ iss: a.email, scope: SCOPES, aud: TOKEN_URL, iat: now, exp: now + 3600 }));
    const sig = createSign("RSA-SHA256").update(`${head}.${claims}`).sign(a.key, "base64url");
    body = new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${head}.${claims}.${sig}`,
    });
  }

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) throw new Error(`Google token ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cached = { token: json.access_token, exp: now + json.expires_in };
  return cached.token;
}

async function google<T>(url: string, init: { method?: string; body?: unknown; raw?: BodyInit; type?: string } = {}) {
  const res = await fetch(url, {
    method: init.method ?? (init.body || init.raw ? "POST" : "GET"),
    headers: {
      Authorization: `Bearer ${await accessToken()}`,
      ...(init.body ? { "Content-Type": "application/json" } : init.type ? { "Content-Type": init.type } : {}),
    },
    body: init.raw ?? (init.body ? JSON.stringify(init.body) : undefined),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Google ${res.status} ${url}: ${await res.text()}`);
  return (res.status === 204 ? null : await res.json()) as T;
}

/* ---------------------------------------------------------------- Calendar */

/** Lo que guardamos en cada evento para leerlo después (panel, recordatorios). */
export type EventMeta = {
  origen: "web-diagnostico" | "web-espera";
  nombre: string;
  telefono: string;
  email?: string;
  servicio?: string;
  cabello?: string;
  recordado?: "1";
  asistencia?: "llego" | "no-llego";
};

export type CalEvent = {
  id: string;
  summary?: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  extendedProperties?: { private?: Partial<EventMeta> & Record<string, string> };
  htmlLink?: string;
  colorId?: string;
};

const calUrl = (path = "") => `${CAL}/calendars/${encodeURIComponent(calendarId()!)}/events${path}`;

/** Bloques ocupados del calendario de Diana en la ventana dada. */
export async function busyBetween(timeMin: string, timeMax: string): Promise<Busy[]> {
  const id = calendarId()!;
  const json = await google<{ calendars: Record<string, { busy: Busy[]; errors?: unknown[] }> }>(`${CAL}/freeBusy`, {
    body: { timeMin, timeMax, timeZone: agenda.timeZone, items: [{ id }] },
  });
  const cal = json.calendars[id];
  if (cal?.errors?.length) throw new Error(`Google Calendar freeBusy: ${JSON.stringify(cal.errors)}`);
  return cal?.busy ?? [];
}

export async function createEvent(e: {
  summary: string;
  description: string;
  start: string;
  end: string;
  meta: EventMeta;
  allDay?: boolean;
}) {
  const when = (iso: string) => (e.allDay ? { date: iso.slice(0, 10) } : { dateTime: iso, timeZone: agenda.timeZone });
  return google<CalEvent>(calUrl(), {
    body: {
      summary: e.summary,
      description: e.description,
      start: when(e.start),
      end: when(e.end),
      // amarillo para las citas de la web; gris y «libre» para la lista de espera
      colorId: e.meta.origen === "web-espera" ? "8" : "5",
      transparency: e.meta.origen === "web-espera" ? "transparent" : "opaque",
      reminders: { useDefault: false, overrides: e.allDay ? [] : [{ method: "popup", minutes: 60 }] },
      extendedProperties: { private: e.meta },
    },
  });
}

/** Eventos creados por la web en una ventana de tiempo. */
export async function listEvents(timeMin: string, timeMax: string, origen: EventMeta["origen"]) {
  const q = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "250",
    privateExtendedProperty: `origen=${origen}`,
  });
  const json = await google<{ items: CalEvent[] }>(`${calUrl()}?${q}`);
  return json.items ?? [];
}

/** Cambia solo las propiedades indicadas (y el color, si se da). */
export async function patchEvent(id: string, meta: Partial<EventMeta>, colorId?: string) {
  return google<CalEvent>(calUrl(`/${encodeURIComponent(id)}`), {
    method: "PATCH",
    body: { extendedProperties: { private: meta }, ...(colorId ? { colorId } : {}) },
  });
}

/* ---------------------------------------------------------------- Drive */

/** Sube un archivo a la carpeta de Diana y devuelve el enlace para verlo (solo ella tiene acceso). */
export async function uploadToDrive(name: string, mime: string, data: ArrayBuffer) {
  const boundary = `dm${Date.now().toString(36)}`;
  const meta = JSON.stringify({ name, parents: [folderId()!] });
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Type: ${mime}\r\n\r\n`),
    Buffer.from(data),
    Buffer.from(`\r\n--${boundary}--`),
  ]);
  const file = await google<{ id: string; webViewLink: string }>(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink&supportsAllDrives=true",
    { raw: body, type: `multipart/related; boundary=${boundary}` },
  );
  return file.webViewLink;
}
