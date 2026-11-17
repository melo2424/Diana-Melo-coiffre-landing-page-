# DESIGN.md — Diana Melo Coiffé

Sistema de diseño de la landing de Diana Melo (@dianamelocolorlab), colorista y estilista en Colombia.
Tokens en código: [src/app/globals.css](src/app/globals.css). Si este documento y el CSS discrepan, se corrige uno de los dos en el mismo commit.

---

## 0. Rediseño del 17-11-2026: «Fotografías a tamaños desiguales»

Sustituye las secciones 1, 7 y 9 en lo que contradigan. Paleta y tipografía de marca se mantienen (`--keep palette,type`).
Ficha: `.taste-skill/direction.json` (dirección `uneven-photographs`, semilla `1442066657`; la anterior quedó en `direction-darkroom.json`); hero redibujado a «título escalonado con dos fotos» porque no hay fotos horizontales).

**La idea.** La carta de tonos de Diana (Arena, Miel, Cobre, Perla…) se convierte en el filtro del muro de trabajos: las fotos cuelgan como copias en una pared de galería, a tamaños distintos y con huecos a propósito, y cada una lleva su muestra de color.

**La cosa viva.** Familias (Rubios, Balayage, Cobrizos, Rizos, Cortes) + muestras de tono. Al elegir, el muro se reordena (layout animations) y el botón se reescribe: «Quiero un tono Miel» abre el chat con el mensaje escrito. Cada foto abre un visor con «Quiero este tono».

**Movimiento firma.** Fundido lento entre retratos de clientas en el hero (1,6 s, 5,6 s por foto; se pausa con la pestaña oculta y se desactiva con movimiento reducido). Alrededor: titulares que salen de una máscara palabra a palabra, parallax en fotos, la línea «Diana / Melo» que se separa con el scroll, fila de Olaplex que se desliza, header que se esconde al bajar.

**Secciones.** Hero (título escalonado + retrato que cambia + detalle de rizos) → Trabajos (muro + carta de tonos + visor) → Servicios (campo marfil, filas que agendan) → Diana (dos fotos de eventos + bloque dorado con el monograma DM) → Así es tu cita (tres fotos en diagonal) → Olaplex (fila con una pieza levantada) → Agenda tu cita → Footer (el nombre sobre la última foto).

**Componentes.** Las secciones viven en [src/components/sections/](src/components/sections/). `Button`, `SectionHeading` y `Exhibit` (§8) se retiraron: cada sección arma sus botones y titulares animados (`SplitReveal`). Los tonos y sus muestras están en `tones` de [src/data/images.ts](src/data/images.ts).

**Agendamiento.** `bookingLink(mensaje)` en [src/data/site.ts](src/data/site.ts): WhatsApp con texto prellenado cuando haya número; mientras tanto, el chat de Instagram.

---

## 1. Dirección de arte

### Se propusieron dos

| | A · «Editorial de revista» | B · «Laboratorio de color de lujo» — **elegida** |
|---|---|---|
| Composición | El nombre como monumento: «Diana Melo» a 16–24vw, recortado por el borde, sobre marfil; la página se lee como una revista de moda. | **La sala oscura** (`dark-room`): un único campo negro de arriba abajo y, dentro, piezas iluminadas. Cada trabajo de color se expone como una muestra con espacio alrededor. |
| A favor | Muy de moda, tipográfica, ligera. | Sale del propio material del estudio: **las clientas posan con batas de satén negro con monograma dorado** y el cabello es lo único iluminado. Ese es exactamente el contraste de la paleta negro/dorado. |
| En contra | Usa el marfil como fondo dominante y relega el negro: va contra la paleta pedida. Un monumento tipográfico lo puede tener cualquier salón. | Riesgo de página vacía o de gris sobre negro: se compensa con fotos grandes y texto en tinta clara a 16:1. |

**Por qué B.** La paleta negro/dorado no es un tema: ya existe en el estudio (batas negras, monograma dorado, cabello claro sobre satén). La sala oscura convierte eso en el lenguaje de la página. Del monumento (A) se conserva una sola cosa: el nombre a todo el ancho en el primer pantallazo y en el footer.

Ficha generada con `taste-skill` → `.taste-skill/direction.json` (semilla `1754322355`, sector `fashion`, tono `luxury`, `--keep palette,type`). Reimprimir: `node ~/.claude/skills/taste-skill/scripts/draw.mjs --show`.

### La idea

> En esta página, **la carta de tonos con nombre propio de Diana** (Arena, Cobre, Perla, Miel…) se convierte en **las piezas iluminadas de la sala oscura**: cada trabajo se expone con su nombre de tono como una muestra de laboratorio.

- «Arena» es real (Diana lo rotula en una de sus publicaciones). El resto de nombres de tono son **propuesta por confirmar** con ella.
- **La cosa viva** (prompt 3): *carta de tonos*. La visitante toca un tono (Arena, Cobre, Perla…), la sala «enciende» solo los trabajos de esa familia y el botón de agendar se rellena con «Quiero un tono Arena». Funciona con el pulgar, con teclado y sin JS (sin JS se ven todos los trabajos).

### Voz de marca (skill `brand`)

| Rasgo | Es | No es |
|---|---|---|
| Experta | Nombra la técnica exacta: balayage, decoloración, matiz, corrección. | Tecnicismo para impresionar. |
| Cercana | Tutea con calidez colombiana; frases cortas. «Cuéntame qué color tienes hoy.» | «Párele bolas» en titulares: lo coloquial queda para Instagram. |
| Precisa | Dice cuánto dura, qué incluye, qué cuidado necesita. | Superlativos vacíos («el mejor», «increíble», «transforma tu vida»). |
| Honesta | Fotos reales de clientas reales, sin retoque de catálogo. | Testimonios, cifras o prensa inventados. |

Español de Colombia, tuteo. Nada de «¡Agenda YA!», signos dobles ni mayúsculas sostenidas.

---

## 2. Paleta

| Token | Hex | Rol |
|---|---|---|
| `ink` | `#0B0B0C` | **Fondo** de toda la página (la sala). |
| `onyx` | `#17161A` | Superficie un paso más clara: fondo de huecos de imagen, panel de menú. |
| `graphite` | `#2A282D` | Superficie elevada / hover sobre oscuro. |
| `gold` | `#C6A15B` | **Acento.** El botón principal y como mucho un detalle más por pantalla («Coiffé» en el logotipo, el subrayado de enlaces). |
| `gold-light` | `#E7D3A1` | Hover del acento; dorado para texto grande. |
| `gold-deep` | `#8F6E35` | Dorado sobre marfil, **solo ≥ 24px** o decorativo. |
| `ivory` | `#EFEEEB` | Fondo claro: footer invertido y tarjeta de visita. |
| `pearl` | `#ECEBE7` | **Tinta de lectura** sobre oscuro (no blanco puro). |
| `stone` | `#8C867D` | Texto secundario sobre oscuro. |
| `stone-deep` | `#6B665E` | *Añadido.* Texto secundario sobre marfil (el `stone` no llega a AA ahí). |
| `white` | `#FFFFFF` | Reservado. No se usa para texto largo. |

Proporción: ~85 % `ink`, ~10 % fotografía, ~4 % `pearl` (texto), ~1 % `gold`. El marfil solo aparece en el footer y en la tarjeta de visita.

### Contraste WCAG (medido)

| Texto / fondo | Ratio | Nivel |
|---|---|---|
| pearl / ink | 16.42 | AAA |
| ivory / ink | 18.40 | AAA |
| gold / ink | 8.10 | AAA |
| stone / ink | 5.45 | AA (solo secundario) |
| stone / onyx | 4.99 | AA (solo secundario) |
| gold / graphite | 6.01 | AA |
| ink / gold (texto del botón) | 8.10 | AAA |
| ink / ivory | 18.40 | AAA |
| stone-deep / ivory | 5.33 | AA |
| gold-deep / ivory | 4.41 | Solo texto grande |
| **gold / ivory** | **2.27** | **Prohibido para texto** |
| **stone / ivory** | **3.37** | **Prohibido para texto** |

---

## 3. Tipografía

| Rol | Familia | Por qué |
|---|---|---|
| Display (h1–h3, logotipo) | **Bodoni Moda** (variable, eje `opsz`, 400) | Didone de alto contraste: el mismo linaje que el monograma «DM» bordado en las batas del estudio. Peso 400 y `opsz 96`: los trazos finos brillan sobre negro; nada de negrita, que se ve barata sobre negro. |
| Texto e interfaz | **Jost** (variable, 400–500) | Geométrica de herencia Futura: el par clásico Bodoni + Futura de las revistas de moda. Legible a 16–17px. |

Se descartaron Playfair + Inter (lo que proponía `ui-ux-pro-max`: es la combinación por defecto de cualquier web «de lujo») y Cormorant (se rompe a tamaños de lectura).

### Escala: cinco pasos, ninguno más

| Token | Valor | Uso |
|---|---|---|
| `text-monument` | `clamp(3.5rem, 12.55vw, 14.5rem)` · lh 0.86 · −0.035em | El nombre, de margen a margen. Solo hero y footer. |
| `text-title` | `clamp(2.25rem, 5.2vw, 4.75rem)` · lh 0.98 · −0.025em | h2 de sección. |
| `text-statement` | `clamp(1.5rem, 2.5vw, 2.25rem)` · lh 1.22 | Frases destacadas (`<p>`), ≤ 36px, ≤ 25 palabras. |
| `text-body` | 17px · lh 1.6 | Todo el texto corrido, en `pearl`. |
| `text-small` | 14px · lh 1.45 | Pies de foto, legal. Nunca < 13px. |

Reglas: titulares en **dos líneas como máximo** en cualquier ancho. Medida de lectura 45–75 caracteres. Alineado a la izquierda (se centra como mucho un momento por página).

---

## 4. Espaciado y marco

- Base 4px (escala de Tailwind).
- Margen exterior `--gutter`: `clamp(20px, 5vw, 80px)` (márgenes amplios de galería). Igual a ambos lados, siempre.
- Separación entre secciones `--section-gap`: `clamp(120px, 14vw, 216px)`.
- Título → frase de apoyo: 24px (móvil) / 32px (escritorio). Título → contenido: 64px.
- Retícula de 12 columnas en `md+`, 2 en móvil. La asimetría vive dentro de la retícula, nunca en el marco.
- Header fijo de 72px (`--header-h`); `scroll-padding-top` lo compensa en las anclas.

## 5. Radios

**0 en todo.** Botones, fotos, tarjetas y paneles con esquinas rectas. (Decidido una vez: la sala oscura es arquitectura, no app.)

## 6. Sombras

**Ninguna en reposo.** Las superficies se separan por un paso de tono (`ink` → `onyx` → `graphite`), nunca por línea ni sombra. Solo lleva sombra lo que flota de verdad (un diálogo, si algún día existe). Sin glows.

## 7. Movimiento (Framer Motion)

| Token | Valor | Uso |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` | Todo. |
| `--dur-fast` | 180ms | Hover/press de controles. |
| `--dur-base` | 320ms | Subrayados, cambios de estado. |
| Entrada | 800ms, sube 24px + opacidad | `<Reveal order={n}>`: título → texto → imagen, escalonado 70ms. Una vez. |
| Fotos | `brightness .88 → 1` en 600ms + `scale 1.025` en 900ms al pasar | Las piezas «se encienden». |

- **Movimiento firma** (prompt 3): *Pinned story*: el título «Diana» queda fijo mientras sus retratos pasan por detrás.
- Solo `transform` y `opacity`. Nada de animar `width/height/top`.
- `prefers-reduced-motion`: se quita el desplazamiento, queda la aparición.
- Sin JS, todo es visible (`<noscript>` en `layout.tsx` anula el estado inicial).

## 8. Componentes base

| Componente | Archivo | Reglas |
|---|---|---|
| **Button** | [src/components/ui/Button.tsx](src/components/ui/Button.tsx) | Siempre un `<a>` (se agenda por WhatsApp/Instagram). `primary`: relleno dorado, texto `ink`, 44px (`md`) o 56px (`lg`), esquinas rectas. `quiet`: enlace de texto con subrayado dorado. **Un solo botón dorado por pantalla**, sin contar el «Agendar cita» fijo del header (en < 640px se acorta a «Agendar»). |
| **SectionHeading** | [src/components/ui/SectionHeading.tsx](src/components/ui/SectionHeading.tsx) | `h2` en `text-title` + una frase en `text-body` debajo. Sin eyebrow, sin número, sin palabra resaltada. `tone="light"` para marfil. |
| **Card → `Exhibit`** | [src/components/ui/Exhibit.tsx](src/components/ui/Exhibit.tsx) | Una pieza expuesta: foto sin marco ni sombra, pie debajo con su `ToneTag`. Se colocan con tamaños y alturas distintos; **nunca en filas iguales**. |
| **Badge → `ToneTag`** | [src/components/ui/ToneTag.tsx](src/components/ui/ToneTag.tsx) | Cuadrado de color lleno (12px) + nombre del tono en 14px. Vive debajo de una foto, nunca encima de un título. No es una píldora. |
| `Picture` | [src/components/ui/Picture.tsx](src/components/ui/Picture.tsx) | `<img>` con `srcSet` WebP, `width/height` reales (sin CLS), `lazy` salvo la del hero. |
| `Reveal` | [src/components/motion/Reveal.tsx](src/components/motion/Reveal.tsx) | Entrada estándar. |

## 9. Planos de sección (de la ficha `dark-room`)

| Sección | Plano | Prompt |
|---|---|---|
| Hero | Tres retratos de clientas en bata negra (perla, platino, beige) + nombre a todo el ancho + frase + botón. *Ajuste respecto a la ficha* («tarjeta sobre sala en penumbra»): no existe ninguna foto horizontal en penumbra del estudio, así que se usa la opción alternativa de la dirección (nombre a todo el ancho bajo la foto). | 1 ✔ / 2 pulir |
| Intro | Frase en escalera (5 líneas escalonadas, ≤ 36px) + 2 fotos a la derecha. | 2 |
| Servicios | Columnas de nombres a un solo tamaño; al pasar, descripción en un punto fijo. | 2 |
| Diana | Título fijo, retratos que pasan detrás (movimiento firma). | 3 |
| Trabajos | Parejas escalonadas en campo vacío + carta de tonos. | 3 |
| Productos | Banda de paneles desiguales (flex 5/2/3/2), Olaplex como vitrina. | 4 |
| Ubicación | Tarjeta de visita marfil sobre foto a pantalla completa, con horario y botón. | 4 |
| Footer | Fondo invertido (marfil), 4 columnas arriba, el nombre a todo el ancho abajo. | 1 provisional / 4 |

## 10. Qué NO hacer

- **Nada de gradientes**: ni fondos, ni botones, ni texto. Excepción única: un velo neutro bajo texto sobre foto.
- **Nada de morado, violeta, índigo** ni rosa «beauty». Nada de neón.
- **Nada de emojis**, ni en la web ni en los textos alternativos.
- **Nada de tarjetas idénticas en fila** (ni de iconos sobre tarjetas). Las piezas cambian de tamaño y posición.
- **Nada de fotos de stock genéricas.** Solo fotos reales del estudio; si falta una, se deja el hueco en `onyx` y se pide a Diana.
- Nada de eyebrows (etiqueta pequeña sobre el título), píldoras, «Nuevo ·», mayúsculas pequeñas espaciadas, numeraciones 01/02/03, monoespaciada, líneas finas divisorias, cajas con borde de 1px, vidrio/blur, sombras en reposo.
- Nada de palabra resaltada en un titular (cursiva, otro color, subrayado).
- No poner el dorado sobre marfil para texto (2.27:1).
- No usar a gran tamaño las fotos con texto incrustado o marcas de agua (campo `overlay` en `images.ts`).
- No inventar testimonios, cifras, premios ni prensa. Nada de precios ni carrito en Productos.
