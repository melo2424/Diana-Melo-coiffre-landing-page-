/** Freno sencillo contra envíos repetidos: `limit` por clave cada 10 minutos (memoria del proceso). */
const hits = new Map<string, number[]>();

export function tooMany(key: string, limit: number) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > limit;
}

/** Texto limpio y recortado de un campo de formulario o JSON. */
export const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
