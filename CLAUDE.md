@AGENTS.md

# Diana Melo Coiffé — landing page

Web de presentación y agendamiento de **Diana Melo** (Instagram [@dianamelocolorlab](https://www.instagram.com/dianamelocolorlab/)), colorista y estilista en Colombia. Especialidad: **colorimetría** (balayage, rubios, decoloración, corrección de color), además de corte, peinado y maquillaje de novia.
Público: mujeres en Colombia que buscan una colorista experta y de confianza. Sitio en **español de Colombia** (tuteo).

**Agenda e integraciones**: agenda de diagnóstico conectada a Google Calendar (fotos a Drive, lista de espera, recordatorios), panel privado en `/diana`, quiz, probador de color (MediaPipe), antes/después, reseñas de Google, guías `/cuidado/*` y páginas `/tono/*`. Todo lo externo es opcional y está en **[AGENDA.md](AGENDA.md)**.

**No es una tienda.** Los productos Olaplex se muestran como vitrina: sin precios, carrito ni compra. El agendamiento sale por WhatsApp (o Instagram mientras no haya número).

Diseño: lee **[DESIGN.md](DESIGN.md)** antes de tocar cualquier cosa visual. Dirección «sala oscura» (`dark-room`), Bodoni Moda + Jost, paleta negro/dorado/marfil, botones en píldora (`<Cta>`), muestras redondas; ver §0b de DESIGN.md.

## Stack

- Next.js 16.4 (App Router, `cacheComponents: true`) + React 19.3 + TypeScript 5
- Tailwind CSS 4.3 (tokens en `@theme` dentro de `src/app/globals.css`; no hay `tailwind.config`)
- Framer Motion 14 (solo en componentes cliente: `src/components/motion/`)
- Fuentes vía `next/font/google`: Bodoni Moda (`--font-bodoni`), Jost (`--font-jost`)
- sharp (dev) para generar las WebP

Avisos de Next 16 (ver `node_modules/next/dist/docs/`):
- `<Image priority>` está obsoleto → `preload`. Aquí no se usa `next/image`: las WebP se sirven con `<Picture>` y `srcSet`.
- Con `cacheComponents`, nada de `new Date()`/`Math.random()` en componentes de servidor sin `"use cache"` (ver `Footer.tsx`).
- **Turbopack + Tailwind no recarga los cambios dentro de `@theme`** en caliente. Los valores cambiantes van como variables en `:root` (p. ej. `--fs-monument`), y si tocas `@theme`, reinicia `npm run dev` borrando `.next`.

## Estructura

```
dianamelocolorlab/            fotos ORIGINALES (no se sirven)
  trabajos/                   22 trabajos de color (miniaturas de Instagram, ~480×640)
  Shooting/                   13 sesiones (960–1284px de ancho)
  Olaplex promocionales/      7 imágenes de producto
public/images/{trabajos,shooting,olaplex}/   WebP generadas: <slug>-<ancho>.webp
scripts/optimize-images.mjs   originales → WebP (640/1080/1600, q78) + manifiesto
src/
  app/            layout.tsx (html, fuentes, SEO, JSON-LD), globals.css (tokens)
    (sitio)/      layout con header/footer; page.tsx (secciones), cuidado/[familia], tono/[tono]
    diana/        panel privado (sin header del sitio)
    api/          agenda, agenda/espera, cron/recordatorios, diana
  components/
    layout/       Header (fijo, menú móvil), Footer
    ui/           Button, SectionHeading, Exhibit (card), ToneTag (badge), Picture
    motion/       Reveal
  data/
    images.ts           alt, categoría, tono y avisos de cada foto (editorial)
    image-manifest.json generado: dimensiones y variantes (no editar a mano)
    site.ts             nombre, nav, contacto, horario (campos POR CONFIRMAR)
DESIGN.md         sistema de diseño
.taste-skill/     ficha de dirección y capturas del inspector (ignorado en git)
```

## Comandos

```bash
npm run dev         # http://localhost:3000
npm run build       # producción
npm run start
npm run lint
npm run typecheck
npm run images      # regenera public/images y src/data/image-manifest.json
# Inspector de diseño (capturas 1440/768/390 + reglas):
node ~/.claude/skills/taste-skill/scripts/inspect.mjs http://localhost:3000
```

Al añadir una foto: déjala en `dianamelocolorlab/<grupo>/`, ejecuta `npm run images` y escribe su entrada en `src/data/images.ts`. Si falta, el build falla a propósito.

## Pendiente de confirmar con Diana

- Cuentas e integraciones (Google, Resend, WhatsApp Business, Places, Plausible): ver AGENDA.md.
- Horario y duración del diagnóstico, dirección del estudio, textos de guías de cuidado y reglas del quiz.
- Fotos de antes y después (con permiso de las clientas) y política de tratamiento de datos.

- Número de WhatsApp, dirección, ciudad (las fotos de eventos apuntan a Villavicencio, Meta) y horario → `src/data/site.ts`.
- Nombre de marca: se pidió «Coiffé»; en las batas se lee «Coiffure». Confirmar la grafía.
- Nombres de tono: solo «Arena» sale de una publicación suya; Miel, Cobre, Perla, Champaña, etc. son propuestas.
- Derechos de las imágenes de Olaplex (material promocional de la marca) y de la captura de pantalla.
- Fotos de trabajos en mayor resolución: las de Instagram son de ~480px y no aguantan tamaños grandes.
- Una foto horizontal en penumbra del estudio (para el hero y Ubicación) y un retrato de Diana.

## Roadmap

- [x] **Prompt 1. Base e identidad**: proyecto Next/TS/Tailwind/Framer, dirección de arte (sala oscura), tokens y contraste, DESIGN.md, CLAUDE.md, WebP + `images.ts` con alt, header/footer, página con marcadores por sección.
- [ ] **Prompt 2. Hero e intro + Servicios**: pulir el hero, frase en escalera, Servicios con contenido completo (técnicas, duración aproximada, qué incluye) en columnas de nombres con descripción al pasar.
- [ ] **Prompt 3. Diana + Trabajos**: sección «Diana» con título fijo y retratos (movimiento firma), galería en parejas escalonadas y **carta de tonos** interactiva que filtra trabajos y rellena el mensaje de agendamiento.
- [ ] **Prompt 4. Productos + Ubicación + footer**: vitrina Olaplex (banda de paneles desiguales, sin precios), tarjeta de visita con dirección, horario y WhatsApp sobre foto, footer definitivo.
- [ ] **Prompt 5. Pulido y salida**: capa de movimiento completa, SEO (metadata, Open Graph, JSON-LD `HairSalon`), favicon con monograma, accesibilidad y rendimiento (Lighthouse), inspector a 0 FAIL en build de producción, despliegue.
