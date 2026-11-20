/**
 * Métricas sin datos personales (Plausible, si NEXT_PUBLIC_PLAUSIBLE_DOMAIN está definido).
 * Nunca se envían nombres, teléfonos ni correos: solo qué se eligió.
 */
type Props = Record<string, string | number | boolean>;

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Props }) => void;
  }
}

export function track(event: string, props?: Props) {
  if (typeof window === "undefined") return;
  try {
    window.plausible?.(event, props ? { props } : undefined);
  } catch {
    /* las métricas nunca rompen la página */
  }
}
