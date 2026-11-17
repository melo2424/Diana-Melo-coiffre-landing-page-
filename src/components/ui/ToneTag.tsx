/**
 * "Badge" del sistema: la etiqueta de tono de la carta de color de Diana.
 * Un cuadrado de color lleno + el nombre del tono en tamaño legible.
 * No es una píldora ni un eyebrow: vive DEBAJO de una foto, como pie.
 */
export const toneSwatches: Record<string, string> = {
  Arena: "#C9AE86",
  Miel: "#B9853F",
  Champaña: "#E3CFA4",
  Beige: "#D6C2A0",
  Perla: "#E9E1D2",
  Vainilla: "#EBD9AE",
  Dorado: "#C29147",
  Cobre: "#B0552B",
  Chocolate: "#5A3A26",
  Caramelo: "#A26A35",
  Ceniza: "#BDB6A6",
  Platino: "#EDEBE4",
};

type Props = {
  tone: string;
  detail?: string;
  surface?: "dark" | "light";
  className?: string;
};

export function ToneTag({ tone, detail, surface = "dark", className = "" }: Props) {
  const swatch = toneSwatches[tone] ?? "var(--gold)";
  return (
    <span className={`inline-flex items-center gap-2.5 text-small ${className}`}>
      <span aria-hidden className="inline-block size-3 shrink-0" style={{ background: swatch }} />
      <span className={surface === "dark" ? "text-text" : "text-ink"}>{tone}</span>
      {detail ? (
        <span className={surface === "dark" ? "text-muted" : "text-stone-deep"}>{detail}</span>
      ) : null}
    </span>
  );
}
