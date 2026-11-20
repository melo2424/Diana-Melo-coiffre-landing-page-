"use client";

import { useState } from "react";
import { retouchLink } from "@/lib/agenda/format";
import { CtaButton } from "@/components/ui/Cta";
import { track } from "@/lib/track";

/** «Recuérdame el retoque»: evento en el calendario de la clienta, contado desde el día de su color. */
export function RetouchReminder({ weeks, what, bookingUrl }: { weeks: number; what: string; bookingUrl: string }) {
  // Vacío = hoy. La fecha se calcula al tocar el botón (no durante el prerender).
  const [day, setDay] = useState("");

  const open = () => {
    const from = day || new Date(Date.now() - 5 * 3600_000).toISOString().slice(0, 10);
    track("Recordatorio retoque", { semanas: weeks });
    window.open(retouchLink(`${from}T10:00:00-05:00`, weeks, what, bookingUrl), "_blank", "noopener");
  };

  return (
    <div className="mt-6">
      <label className="block text-small text-muted">
        ¿Cuándo te hiciste el color? <span className="text-muted/70">(vacío = hoy)</span>
        <input
          type="date"
          value={day}
          onChange={(e) => setDay(e.target.value)}
          className="mt-2 block h-11 w-full rounded-2xl bg-ink px-4 text-body text-text outline-none ring-1 ring-graphite [color-scheme:dark] focus:ring-2 focus:ring-gold"
        />
      </label>
      <CtaButton onClick={open} className="mt-4">
        Recuérdame el retoque
      </CtaButton>
    </div>
  );
}
