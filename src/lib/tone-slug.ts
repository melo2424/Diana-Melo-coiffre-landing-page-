import { tones } from "@/data/images";

/** "Champaña" → "champana" */
export const toneSlug = (t: string) =>
  t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

export const toneFromSlug = (slug: string) => Object.keys(tones).find((t) => toneSlug(t) === slug);
