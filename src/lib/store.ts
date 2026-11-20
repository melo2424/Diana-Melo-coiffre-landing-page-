"use client";

import { useSyncExternalStore } from "react";

/**
 * Estado compartido entre secciones de la página (sin librerías):
 * el quiz y el probador le pasan datos a la agenda; la rueda le pasa tonos al probador.
 */
export type Prefill = { service?: string; hair?: string; notes?: string; nonce: number };

type State = { prefill: Prefill | null; tryTone: { tone: string; nonce: number } | null };

let state: State = { prefill: null, tryTone: null };
const listeners = new Set<() => void>();

function set(patch: Partial<State>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useShared<T>(select: (s: State) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => select(state),
    () => select({ prefill: null, tryTone: null }),
  );
}

/** Llena la agenda y lleva a la clienta hasta ella. */
export function prefillBooking(p: Omit<Prefill, "nonce">) {
  set({ prefill: { ...p, nonce: Date.now() } });
  document.getElementById("agendar")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** Abre el probador con un tono elegido. */
export function tryTone(tone: string) {
  set({ tryTone: { tone, nonce: Date.now() } });
  document.getElementById("probador")?.scrollIntoView({ behavior: "smooth", block: "start" });
}
