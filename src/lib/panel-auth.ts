import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Acceso al panel de Diana con una contraseña (DIANA_PANEL_PASSWORD).
 * La cookie guarda una firma derivada de la contraseña: si la contraseña cambia, todas las sesiones caducan.
 */
export const PANEL_COOKIE = "dm_panel";

const password = () => process.env.DIANA_PANEL_PASSWORD?.trim() || "";
export const panelConfigured = () => password().length >= 8;

export const panelToken = () => createHmac("sha256", password()).update("diana-panel-v1").digest("hex");

const same = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export const checkPassword = (attempt: string) => panelConfigured() && same(attempt, password());

export async function isPanelAuthed() {
  if (!panelConfigured()) return false;
  const v = (await cookies()).get(PANEL_COOKIE)?.value ?? "";
  return same(v, panelToken());
}
