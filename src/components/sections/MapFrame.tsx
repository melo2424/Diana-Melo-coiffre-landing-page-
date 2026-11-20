"use client";

import { useState } from "react";

/**
 * El iframe de Google Maps, quieto hasta que la clienta lo toca: así el mapa no «se traga»
 * el scroll de la página en el teléfono. Al salir con el ratón vuelve a quedar quieto.
 */
export function MapFrame({ src, title, pin }: { src: string; title: string; pin: boolean }) {
  const [active, setActive] = useState(false);

  return (
    <div className="relative h-full w-full" onPointerLeave={(e) => e.pointerType === "mouse" && setActive(false)}>
      <iframe
        src={src}
        title={title}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className={`map-dark h-full w-full border-0 ${active ? "" : "pointer-events-none"}`}
        allowFullScreen
      />

      {/* el pin de la marca, sobre el centro del mapa (solo con dirección exacta) */}
      {pin && !active ? (
        <span aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
          {/* el desplazamiento lo pone la animación (map-pulse), centrado en la punta del pin */}
          <span className="map-pulse absolute bottom-0 left-1/2 size-14 rounded-full bg-gold/40" />
          <svg viewBox="0 0 32 44" className="relative h-11 w-8 drop-shadow-[0_8px_14px_rgb(0_0_0/0.6)]">
            <path d="M16 0C7.2 0 0 7 0 15.7 0 27.5 16 44 16 44s16-16.5 16-28.3C32 7 24.8 0 16 0Z" fill="var(--gold)" />
            <circle cx="16" cy="15.5" r="6" fill="var(--ink)" />
          </svg>
        </span>
      ) : null}

      {!active ? (
        <button
          type="button"
          onClick={() => setActive(true)}
          className="group absolute inset-0 flex items-end justify-end p-4 lg:p-6"
          aria-label="Activar el mapa para moverlo"
        >
          <span className="rounded-full bg-ink/80 px-4 py-2 text-small text-pearl ring-1 ring-white/10 backdrop-blur-sm transition-colors group-hover:bg-gold group-hover:text-ink">
            Toca para mover el mapa
          </span>
        </button>
      ) : null}
    </div>
  );
}
