import { ImageResponse } from "next/og";
import { tones } from "@/data/images";
import { toneFromSlug, toneSlug } from "@/lib/tone-slug";

export const alt = "Mi tono, por Diana Melo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return Object.keys(tones).map((t) => ({ tono: toneSlug(t) }));
}

/** Tarjeta para compartir en WhatsApp / Instagram: la muestra del tono sobre negro y oro. */
export default async function Image({ params }: { params: Promise<{ tono: string }> }) {
  const tone = toneFromSlug((await params).tono) ?? "Miel";
  const color = tones[tone];
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#0b0b0c", color: "#ecebe7", padding: 80, alignItems: "center", gap: 80 }}>
        <div
          style={{
            width: 360,
            height: 360,
            borderRadius: 9999,
            background: color,
            boxShadow: "inset 0 -20px 40px rgba(0,0,0,0.25), inset 0 20px 30px rgba(255,255,255,0.3), 0 0 0 10px #0b0b0c, 0 0 0 12px #c6a15b",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 36, color: "#c6a15b", letterSpacing: 6 }}>MI TONO</div>
          <div style={{ fontSize: 150, lineHeight: 1, marginTop: 10 }}>{tone}</div>
          <div style={{ fontSize: 34, marginTop: 40, color: "#8c867d" }}>Diana Melo · Colorista</div>
        </div>
      </div>
    ),
    size,
  );
}
