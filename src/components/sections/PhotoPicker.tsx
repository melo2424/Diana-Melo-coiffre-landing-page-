"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

export type Photos = { actual?: File; referencia?: File };

/** Reduce la foto en el teléfono antes de subirla (máx. 1600 px, JPEG): sube rápido aunque la señal sea mala. */
export async function shrink(file: File, max = 1600): Promise<File> {
  const bmp = await createImageBitmap(file).catch(() => null);
  if (!bmp) return file;
  const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * k);
  canvas.height = Math.round(bmp.height * k);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.82));
  return blob ? new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" }) : file;
}

const slots = [
  { key: "actual", label: "Tu cabello hoy", hint: "Con luz natural, de espalda" },
  { key: "referencia", label: "El color que te gusta", hint: "Una foto de referencia" },
] as const;

export function PhotoPicker({ value, onChange, error }: { value: Photos; onChange: (p: Photos) => void; error?: string }) {
  return (
    <fieldset className="mt-6">
      <legend className="mb-3 text-small text-muted">Fotos (opcional): le ayudan a Diana a preparar tu diagnóstico</legend>
      <div className="grid grid-cols-2 gap-3">
        {slots.map((s) => (
          <Slot
            key={s.key}
            label={s.label}
            hint={s.hint}
            file={value[s.key]}
            onFile={(f) => onChange({ ...value, [s.key]: f })}
          />
        ))}
      </div>
      {error ? <p className="mt-2 text-small text-[#f0a29a]">{error}</p> : null}
    </fieldset>
  );
}

function Slot({ label, hint, file, onFile }: { label: string; hint: string; file?: File; onFile: (f?: File) => void }) {
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!file) return;
    const u = URL.createObjectURL(file);
    // la vista previa se crea al elegir el archivo y se libera al cambiarlo
    queueMicrotask(() => setUrl(u));
    return () => URL.revokeObjectURL(u);
  }, [file]);

  return (
    <div className="relative">
      <label className="group relative flex aspect-[4/5] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl bg-ink text-center ring-1 ring-graphite transition-shadow hover:ring-gold/60 focus-within:ring-2 focus-within:ring-gold">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (!f) return;
            setBusy(true);
            onFile(await shrink(f));
            setBusy(false);
          }}
        />
        <AnimatePresence mode="wait" initial={false}>
          {file && url ? (
            <motion.img
              key={url}
              src={url}
              alt={label}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <motion.span key="vacío" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-3">
              <span className="mx-auto grid size-11 place-items-center rounded-full text-gold-light ring-1 ring-gold/45 transition-colors group-hover:bg-gold group-hover:text-ink">
                {busy ? (
                  <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
                    <circle cx="12" cy="13" r="3.5" />
                  </svg>
                )}
              </span>
              <span className="mt-3 block text-small text-text">{label}</span>
              <span className="block text-[0.8125rem] text-muted">{hint}</span>
            </motion.span>
          )}
        </AnimatePresence>
      </label>
      {file ? (
        <button
          type="button"
          onClick={() => {
            onFile(undefined);
            setUrl(null);
          }}
          aria-label={`Quitar foto: ${label}`}
          className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-ink/80 text-text hover:bg-gold hover:text-ink"
        >
          ×
        </button>
      ) : null}
    </div>
  );
}
