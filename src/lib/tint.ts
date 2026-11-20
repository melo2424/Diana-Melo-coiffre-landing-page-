/**
 * Probador de color: detecta el cabello con MediaPipe (en el navegador, la foto no sale del teléfono)
 * y lo tiñe conservando luces y sombras.
 */

const VERSION = "1.2.2"; // misma versión que package.json
const WASM = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VERSION}/wasm`;
const MODEL = "https://storage.googleapis.com/mediapipe-models/image_segmenter/hair_segmenter/float32/latest/hair_segmenter.tflite";

type Segmenter = import("@mediapipe/tasks-vision").ImageSegmenter;
let segmenter: Promise<Segmenter> | null = null;

function load() {
  segmenter ??= (async () => {
    const { FilesetResolver, ImageSegmenter } = await import("@mediapipe/tasks-vision");
    const files = await FilesetResolver.forVisionTasks(WASM);
    const make = (delegate: "GPU" | "CPU") =>
      ImageSegmenter.createFromOptions(files, {
        baseOptions: { modelAssetPath: MODEL, delegate },
        runningMode: "IMAGE",
        outputConfidenceMasks: true,
        outputCategoryMask: false,
      });
    return make("GPU").catch(() => make("CPU"));
  })().catch((e) => {
    segmenter = null;
    throw e;
  });
  return segmenter;
}

/** Dibuja la foto en un lienzo de máximo `max` px por lado. */
export function toCanvas(img: CanvasImageSource & { width: number; height: number }, max = 1080) {
  const k = Math.min(1, max / Math.max(img.width, img.height));
  const c = document.createElement("canvas");
  c.width = Math.round(img.width * k);
  c.height = Math.round(img.height * k);
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
  return c;
}

/** Máscara de cabello (0–1 por píxel) del tamaño del lienzo. */
export async function hairMask(canvas: HTMLCanvasElement) {
  const seg = await load();
  const res = seg.segment(canvas);
  const masks = res.confidenceMasks ?? [];
  const hair = masks[masks.length - 1]; // el modelo devuelve [fondo, cabello]
  const data = hair.getAsFloat32Array().slice();
  const w = hair.width;
  const h = hair.height;
  masks.forEach((m) => m.close());
  if (w === canvas.width && h === canvas.height) return data;
  // reescalar (vecino más cercano) si el modelo devolvió otro tamaño
  const out = new Float32Array(canvas.width * canvas.height);
  for (let y = 0; y < canvas.height; y++)
    for (let x = 0; x < canvas.width; x++)
      out[y * canvas.width + x] = data[Math.floor((y * h) / canvas.height) * w + Math.floor((x * w) / canvas.width)];
  return out;
}

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);

function rgbToHsl(r: number, g: number, b: number) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h / 6, s, l];
}

function hslToRgb(h: number, s: number, l: number) {
  if (s === 0) return [l, l, l];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const f = (t: number) => {
    t = (t + 1) % 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [f(h + 1 / 3), f(h), f(h - 1 / 3)];
}

/**
 * Tiñe el cabello: toma el matiz y la saturación del tono elegido y desplaza la luminosidad
 * hacia la del tono (para que un platino aclare y un chocolate oscurezca), conservando el relieve.
 */
export function paint(src: HTMLCanvasElement, mask: Float32Array, toneHex: string, strength = 0.85) {
  const out = document.createElement("canvas");
  out.width = src.width;
  out.height = src.height;
  const ctx = out.getContext("2d")!;
  const base = src.getContext("2d")!.getImageData(0, 0, src.width, src.height);
  const px = base.data;

  // luminosidad media del cabello actual
  let sum = 0;
  let n = 0;
  for (let i = 0; i < mask.length; i++) {
    if (mask[i] > 0.6) {
      sum += (0.2126 * px[i * 4] + 0.7152 * px[i * 4 + 1] + 0.0722 * px[i * 4 + 2]) / 255;
      n++;
    }
  }
  const meanL = n ? sum / n : 0.35;
  const [th, ts, tl] = rgbToHsl(...(hex(toneHex) as [number, number, number]));
  const shift = (tl - meanL) * 0.8;

  for (let i = 0; i < mask.length; i++) {
    const m = mask[i];
    if (m < 0.05) continue;
    const a = Math.min(1, Math.max(0, (m - 0.05) / 0.55)) * strength; // borde suave
    const r = px[i * 4] / 255;
    const g = px[i * 4 + 1] / 255;
    const b = px[i * 4 + 2] / 255;
    const [, , l] = rgbToHsl(r, g, b);
    const nl = Math.min(0.97, Math.max(0.03, l + shift));
    const [nr, ng, nb] = hslToRgb(th, Math.min(1, ts * 0.9 + 0.05), nl);
    px[i * 4] = (r + (nr - r) * a) * 255;
    px[i * 4 + 1] = (g + (ng - g) * a) * 255;
    px[i * 4 + 2] = (b + (nb - b) * a) * 255;
  }
  ctx.putImageData(base, 0, 0);
  return out;
}
