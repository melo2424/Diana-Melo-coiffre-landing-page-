import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { calendarEnabled, listEvents, type CalEvent } from "@/lib/agenda/google";
import { agenda } from "@/lib/agenda/config";
import { formatDay, formatTime } from "@/lib/agenda/format";
import { localDate } from "@/lib/agenda/slots";
import { isPanelAuthed, panelConfigured } from "@/lib/panel-auth";
import { Monogram } from "@/components/brand/Logo";
import { Attendance, Login, Logout } from "./PanelClient";

export const metadata: Metadata = { title: "Panel", robots: { index: false, follow: false } };

/** Panel privado de Diana: sus diagnósticos de la semana y la lista de espera. */
export default function PanelPage() {
  return (
    <main className="min-h-svh px-gutter py-8">
      <header className="flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 text-text" aria-label="Ir a la web">
          <Monogram play="mount" tone="ivory" coiffure={false} className="h-10 w-auto" />
          <span className="font-display text-[1.5rem]">Tu agenda</span>
        </Link>
      </header>
      <Suspense fallback={<p className="mt-16 text-body text-muted">Cargando…</p>}>
        <Panel />
      </Suspense>
    </main>
  );
}

async function Panel() {
  await connection();
  if (!panelConfigured()) {
    return (
      <Notice title="El panel aún no tiene contraseña">
        Define <code className="text-gold-light">DIANA_PANEL_PASSWORD</code> (mínimo 8 caracteres) en las variables de entorno. Ver
        AGENDA.md.
      </Notice>
    );
  }
  if (!(await isPanelAuthed())) return <Login />;
  if (!calendarEnabled()) {
    return (
      <>
        <Logout />
        <Notice title="Falta conectar Google Calendar">
          Cuando la agenda esté conectada (AGENDA.md), aquí verás las citas de la semana y la lista de espera.
        </Notice>
      </>
    );
  }

  const now = Date.now();
  const today = localDate(now);
  const from = new Date(`${today}T00:00:00${agenda.offset}`).toISOString();
  const to = new Date(now + 8 * 86_400_000).toISOString();
  let citas: CalEvent[] = [];
  let espera: CalEvent[] = [];
  let error = "";
  try {
    [citas, espera] = await Promise.all([
      listEvents(from, to, "web-diagnostico"),
      listEvents(new Date(now - 30 * 86_400_000).toISOString(), to, "web-espera"),
    ]);
  } catch (err) {
    console.error("[panel]", err);
    error = "No se pudo leer el calendario. Revisa la conexión con Google.";
  }

  const byDay = new Map<string, CalEvent[]>();
  for (const ev of citas) {
    const d = (ev.start.dateTime ?? "").slice(0, 10);
    byDay.set(d, [...(byDay.get(d) ?? []), ev]);
  }

  return (
    <>
      <Logout />
      {error ? <Notice title="Ups">{error}</Notice> : null}

      <section className="mt-10 grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <h1 className="font-display text-title text-text">Diagnósticos</h1>
          <p className="mt-2 text-small text-muted">Hoy y los próximos 7 días · {citas.length} citas</p>

          {byDay.size === 0 ? (
            <p className="mt-10 text-body text-muted">No hay diagnósticos agendados desde la web esta semana.</p>
          ) : (
            [...byDay.entries()].map(([day, list]) => (
              <div key={day} className="mt-10">
                <h2 className="text-small uppercase tracking-[0.14em] text-gold-light">
                  {day === today ? "Hoy · " : ""}
                  {formatDay(`${day}T12:00:00${agenda.offset}`)}
                </h2>
                <ul className="mt-4 space-y-3">
                  {list.map((ev) => (
                    <Appointment key={ev.id} ev={ev} isToday={day === today} />
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>

        <aside className="lg:col-span-4">
          <h2 className="font-display text-statement text-text">Lista de espera</h2>
          <p className="mt-2 text-small text-muted">Clientas que quieren un turno si se libera (últimos 30 días).</p>
          {espera.length === 0 ? (
            <p className="mt-6 text-body text-muted">Nadie en espera.</p>
          ) : (
            <ul className="mt-6 space-y-3">
              {espera.map((ev) => {
                const m = ev.extendedProperties?.private ?? {};
                const first = (m.nombre ?? "").split(" ")[0];
                return (
                  <li key={ev.id} className="rounded-2xl bg-onyx p-4 ring-1 ring-white/5">
                    <p className="text-body text-text">{m.nombre}</p>
                    <p className="text-small text-muted">Prefiere: {m.servicio}</p>
                    <a
                      href={`https://wa.me/${m.telefono}?text=${encodeURIComponent(`Hola ${first}, soy Diana. Se liberó un turno para tu diagnóstico, ¿te sirve?`)}`}
                      target="_blank"
                      rel="noopener"
                      className="mt-3 inline-flex h-10 items-center rounded-full px-4 text-small text-ink bg-gold hover:bg-gold-light"
                    >
                      Avisarle por WhatsApp
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>
      </section>
    </>
  );
}

function Appointment({ ev, isToday }: { ev: CalEvent; isToday: boolean }) {
  const m = ev.extendedProperties?.private ?? {};
  const first = (m.nombre ?? "").split(" ")[0];
  const time = ev.start.dateTime ? formatTime(ev.start.dateTime) : "";
  const remind = `Hola ${first}, soy Diana. Te espero ${isToday ? "hoy" : "para tu diagnóstico"} a las ${time}. ¿Sigues confirmada?`;
  const photos = (ev.description ?? "").split("\n").filter((l) => /^(Cabello hoy|Referencia): https?:/.test(l));
  const notes = (ev.description ?? "").split("\n").find((l) => l.startsWith("Notas: "))?.slice(7);

  return (
    <li className="rounded-2xl bg-onyx p-5 ring-1 ring-white/5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-display text-[1.5rem] leading-none text-gold-light">{time}</p>
          <p className="mt-2 text-body text-text">{m.nombre}</p>
          <p className="text-small text-muted">
            {m.servicio} · cabello {m.cabello?.toLowerCase()}
            {m.recordado === "1" ? " · recordatorio enviado" : ""}
          </p>
          {notes ? <p className="mt-2 max-w-[60ch] text-small text-text/80">“{notes}”</p> : null}
          {photos.length ? (
            <p className="mt-2 flex flex-wrap gap-3 text-small">
              {photos.map((l) => {
                const [label, url] = l.split(": ");
                return (
                  <a key={url} href={url} target="_blank" rel="noopener" className="text-gold-light underline underline-offset-4">
                    Foto: {label.toLowerCase()}
                  </a>
                );
              })}
            </p>
          ) : null}
        </div>
        <Attendance id={ev.id} initial={m.asistencia} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href={`https://wa.me/${m.telefono}?text=${encodeURIComponent(remind)}`}
          target="_blank"
          rel="noopener"
          className="inline-flex h-10 items-center rounded-full bg-gold px-4 text-small text-ink hover:bg-gold-light"
        >
          ¿Sigues confirmada?
        </a>
        <a
          href={`https://wa.me/${m.telefono}`}
          target="_blank"
          rel="noopener"
          className="inline-flex h-10 items-center rounded-full px-4 text-small text-text ring-1 ring-graphite hover:ring-gold/60"
        >
          Escribirle
        </a>
        {ev.htmlLink ? (
          <a
            href={ev.htmlLink}
            target="_blank"
            rel="noopener"
            className="inline-flex h-10 items-center rounded-full px-4 text-small text-muted ring-1 ring-graphite hover:text-text"
          >
            Ver en Calendar
          </a>
        ) : null}
      </div>
    </li>
  );
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-12 max-w-[56ch] rounded-2xl bg-onyx p-6 ring-1 ring-white/5">
      <p className="font-display text-statement text-text">{title}</p>
      <p className="mt-3 text-body text-muted">{children}</p>
    </div>
  );
}
