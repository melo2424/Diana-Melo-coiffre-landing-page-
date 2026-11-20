"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { CtaButton } from "@/components/ui/Cta";

async function post(body: unknown) {
  const res = await fetch("/api/diana", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, error: (json as { error?: string }).error };
}

export function Login() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const r = await post({ action: "login", password });
    setBusy(false);
    if (r.ok) router.refresh();
    else setError(r.error ?? "No se pudo entrar.");
  }

  return (
    <form onSubmit={submit} className="mx-auto mt-24 max-w-sm rounded-[1.75rem] bg-onyx p-8 ring-1 ring-white/5">
      <h1 className="font-display text-statement text-text">Hola, Diana</h1>
      <label className="mt-6 block">
        <span className="mb-2 block text-small text-muted">Contraseña del panel</span>
        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
          autoComplete="current-password"
          className="h-12 w-full rounded-2xl bg-ink px-4 text-body text-text outline-none ring-1 ring-graphite focus:ring-2 focus:ring-gold"
        />
      </label>
      {error ? <p className="mt-2 text-small text-[#f0a29a]">{error}</p> : null}
      <CtaButton type="submit" disabled={busy || !password} className="mt-6">
        {busy ? "Entrando…" : "Entrar"}
      </CtaButton>
    </form>
  );
}

export function Logout() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await post({ action: "logout" });
        router.refresh();
      }}
      className="absolute right-[var(--gutter)] top-9 text-small text-muted hover:text-gold-light"
    >
      Salir
    </button>
  );
}

/** Marca si la clienta llegó o no (queda en el evento: verde o rojo en Google Calendar). */
export function Attendance({ id, initial }: { id: string; initial?: string }) {
  const [value, setValue] = useState(initial ?? "");
  const [error, setError] = useState("");

  const choose = async (estado: "llego" | "no-llego") => {
    const prev = value;
    setValue(estado);
    setError("");
    const r = await post({ action: "asistencia", id, estado });
    if (!r.ok) {
      setValue(prev);
      setError(r.error ?? "Error");
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-1.5" role="group" aria-label="Asistencia">
        {(
          [
            ["llego", "Llegó"],
            ["no-llego", "No llegó"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            aria-pressed={value === k}
            onClick={() => choose(k)}
            className={`h-9 rounded-full px-3.5 text-small transition-colors ${
              value === k
                ? k === "llego"
                  ? "bg-[#6fbf8a] text-ink"
                  : "bg-[#f0a29a] text-ink"
                : "text-muted ring-1 ring-graphite hover:text-text"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {error ? <span className="text-[0.75rem] text-[#f0a29a]">{error}</span> : null}
    </div>
  );
}
