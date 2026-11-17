// Convierte las fotos originales de dianamelocolorlab/ a WebP en varios anchos
// y escribe src/data/image-manifest.json con dimensiones reales.
// Uso: node scripts/optimize-images.mjs
import sharp from "sharp";
import { readdir, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "dianamelocolorlab");
const OUT = path.join(ROOT, "public", "images");
const WIDTHS = [640, 1080, 1600];
const QUALITY = 78;

const groups = [
  { name: "trabajos", dir: path.join(SRC, "trabajos") },
  { name: "shooting", dir: path.join(SRC, "Shooting") },
  { name: "olaplex", dir: path.join(SRC, "Olaplex promocionales") },
];

const slugify = (f) =>
  path
    .parse(f)
    .name.toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const manifest = {};

for (const g of groups) {
  const files = (await readdir(g.dir, { withFileTypes: true }))
    .filter((d) => d.isFile() && /\.(jpe?g|png)$/i.test(d.name))
    .map((d) => d.name)
    .sort();
  await mkdir(path.join(OUT, g.name), { recursive: true });
  manifest[g.name] = [];

  for (const file of files) {
    const slug = slugify(file);
    const input = sharp(path.join(g.dir, file)).rotate();
    const meta = await input.metadata();
    const w0 = meta.autoOrient?.width ?? meta.width;
    const h0 = meta.autoOrient?.height ?? meta.height;
    const variants = [];
    for (const w of WIDTHS.filter((w) => w < w0).concat(w0 <= 1600 ? [w0] : [])) {
      const target = Math.min(w, w0);
      const out = `/images/${g.name}/${slug}-${target}.webp`;
      await sharp(path.join(g.dir, file))
        .rotate()
        .resize({ width: target, withoutEnlargement: true })
        .webp({ quality: QUALITY, effort: 5 })
        .toFile(path.join(ROOT, "public", out));
      variants.push({ w: target, src: out });
    }
    manifest[g.name].push({ slug, source: file, width: w0, height: h0, variants });
    console.log(`${g.name}/${slug} ${w0}x${h0} -> ${variants.map((v) => v.w).join(",")}`);
  }
}

await writeFile(
  path.join(ROOT, "src", "data", "image-manifest.json"),
  JSON.stringify(manifest, null, 2),
);
