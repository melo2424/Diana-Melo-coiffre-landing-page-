import type { MetadataRoute } from "next";
import { site } from "@/data/site";
import { care } from "@/data/care";
import { tones } from "@/data/images";
import { toneSlug } from "@/lib/tone-slug";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${site.url}/`, changeFrequency: "weekly", priority: 1 },
    ...care.map((c) => ({ url: `${site.url}/cuidado/${c.family}`, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...Object.keys(tones).map((t) => ({ url: `${site.url}/tono/${toneSlug(t)}`, changeFrequency: "monthly" as const, priority: 0.5 })),
  ];
}
