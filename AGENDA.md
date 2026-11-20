# Agenda e integraciones

Guía para conectar la web con las cuentas de Diana. **Todo es opcional:** lo que no esté configurado se desactiva solo o pasa a WhatsApp, y la página nunca se rompe. Las variables están en [.env.example](.env.example): cópialo a `.env.local` y, en producción, pon las mismas en el panel del hosting.

| Función | Qué hace | Necesita | Sin configurar |
|---|---|---|---|
| Agenda de diagnóstico | Turnos libres reales y evento en el Calendar de Diana | Google (§1) | Modo «solicitud»: la clienta lo envía por WhatsApp |
| Fotos en la reserva | Foto del cabello y de referencia → Drive de Diana, con enlace en el evento | Google OAuth + carpeta (§1, §2) | Se le pide a la clienta que las mande por WhatsApp |
| Lista de espera | «Avísame si se libera un turno» → evento gris «libre» y en el panel | Google (§1) | Se envía por WhatsApp |
| Panel `/diana` | Citas de la semana, WhatsApp por clienta, marcar llegó/no llegó, lista de espera | `DIANA_PANEL_PASSWORD` + Google | Pide configurar |
| Correos | Confirmación a la clienta, aviso a Diana, recordatorio el día antes | Resend (§3) | No se envían |
| WhatsApp automático | Confirmación y recordatorio desde el número del negocio | Meta WhatsApp Business (§4) | Solo el botón de WhatsApp de siempre |
| Recordatorios diarios | Cada día a las 9 a. m. avisa a las citas de mañana | Vercel Cron + `CRON_SECRET` (§5) | No corren |
| Reseñas | Reseñas reales del perfil de Google | Places API (§6) | La sección no aparece |
| Métricas | Qué tonos se eligen, cuántas terminan agendando | Plausible (§7) | No se mide nada |

Lo que funciona sin cuentas externas: la rueda de tonos con la gota y el botón de compartir, el probador de color, el mini diagnóstico, las guías de cuidado (`/cuidado/...`) con su recordatorio de retoque, las páginas de tono (`/tono/...`) con su imagen para redes, la tarjeta de ubicación, el sitemap y la ficha del salón para Google.

---

## 1. Google: Calendar y Drive

**Opción A, recomendada: OAuth con la cuenta de Diana.** Sirve para Calendar y para las fotos.

1. En <https://console.cloud.google.com/>, crea un proyecto y habilita **Google Calendar API** y **Google Drive API** en *APIs y servicios → Biblioteca*.
2. En *Pantalla de consentimiento de OAuth*, elige tipo **Externo**, agrega el correo de Diana como usuario de prueba y luego **publica la app** («En producción»). Si la app se queda en modo de prueba, el permiso caduca a los 7 días. Google mostrará «app no verificada»; para uso propio basta con pulsar *Avanzado → Continuar*.
3. En *Credenciales → Crear credenciales → ID de cliente de OAuth*, elige el tipo **App de escritorio**. Copia el ID y el secreto.
4. En la terminal ejecuta:

   ```bash
   GOOGLE_OAUTH_CLIENT_ID=... GOOGLE_OAUTH_CLIENT_SECRET=... node scripts/google-oauth.mjs
   ```

   Abre el enlace, entra **con la cuenta de Diana** y acepta. Copia el `GOOGLE_OAUTH_REFRESH_TOKEN` que aparece.
5. `GOOGLE_CALENDAR_ID` es el correo de Gmail de Diana, si se usa su calendario principal.

**Opción B: cuenta de servicio.** Funciona solo para Calendar; los pasos estaban en la versión anterior de esta guía. Crea la cuenta de servicio y su clave JSON, y comparte el calendario con su correo con el permiso «Hacer cambios en eventos». Llena `GOOGLE_CLIENT_EMAIL` y `GOOGLE_PRIVATE_KEY`. Con Gmail personal no puede subir fotos a Drive.

Comprobación: `GET /api/agenda` debe responder `"mode":"calendar"`.

## 2. Fotos de las clientas en Drive

Crea una carpeta en el Drive de Diana, por ejemplo «Fotos clientas web». Su ID es lo que va después de `/folders/` en la URL; ponlo en `GOOGLE_DRIVE_FOLDER_ID`. Las fotos llegan comprimidas (máximo 1600 px), con el nombre `fecha nombre - cabello-hoy.jpg`. Solo Diana tiene acceso a ellas, y el enlace queda en la descripción del evento y en el panel.

## 3. Correos (Resend)

Crea una cuenta en <https://resend.com>, verifica el dominio de la web y crea una API key. Llena `RESEND_API_KEY`, `RESEND_FROM` (por ejemplo `Diana Melo <citas@dominio.com>`) y `DIANA_EMAIL`.

## 4. WhatsApp automático (opcional, tiene costo)

Necesita la **API de WhatsApp Business** de Meta: un negocio verificado en Meta Business, un número dedicado (no puede ser el WhatsApp personal que Diana usa en el teléfono) y **plantillas aprobadas**. Meta cobra por conversación.

Crea dos plantillas en español con dos variables, `{{1}}` para el nombre y `{{2}}` para la fecha y hora. Por ejemplo:

- Confirmación: «Hola {{1}}, tu diagnóstico con Diana Melo quedó para el {{2}}. Si necesitas cambiarlo, respóndenos aquí.»
- Recordatorio: «Hola {{1}}, te recordamos tu diagnóstico de mañana: {{2}}. ¡Te esperamos!»

Llena `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_TEMPLATE_CONFIRMACION` y `WHATSAPP_TEMPLATE_RECORDATORIO`.

Sin esto, el flujo sigue siendo el de siempre: la clienta le escribe a Diana con el mensaje ya armado.

## 5. Recordatorios diarios

[vercel.json](vercel.json) programa `GET /api/cron/recordatorios` todos los días a las 14:00 UTC, que son las 9:00 a. m. en Colombia. Define `CRON_SECRET` en Vercel. La tarea busca los diagnósticos de mañana, envía el correo y/o WhatsApp, y marca cada evento como «recordado» para no repetir el aviso.

Si el hosting no es Vercel, llama esa URL una vez al día con la cabecera `Authorization: Bearer <CRON_SECRET>`.

## 6. Reseñas de Google

Diana necesita un **Perfil de Negocio de Google**.
1. En Google Cloud, habilita **Places API (New)** y crea una API key restringida a esa API.
2. Busca el Place ID del negocio en <https://developers.google.com/maps/documentation/places/web-service/place-id>.
3. Llena `GOOGLE_PLACES_API_KEY` y `GOOGLE_PLACE_ID`.

La web solo muestra reseñas reales, guardadas en caché por horas. El Place ID también mejora el enlace «Cómo llegar».

## 7. Métricas (Plausible)

Crea el sitio en <https://plausible.io> o en una instancia propia y define `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`. Los eventos que se miden son: `Tono elegido`, `Compartir tono`, `Probador`, `Quiz completado`, `Quiz → agenda`, `Agenda día`, `Reserva`, `WhatsApp confirmar`, `Lista de espera` y `Recordatorio retoque`. **Nunca se envían nombres, teléfonos ni correos.**

---

## Ajustes POR CONFIRMAR con Diana

- **Horario, duración, anticipación y días hacia adelante:** [src/lib/agenda/config.ts](src/lib/agenda/config.ts). La tarjeta de ubicación y la ficha de Google toman el horario de ahí.
- **Dirección del estudio:** `address` en [src/data/site.ts](src/data/site.ts).
- **Guías de cuidado:** semanas de retoque, pasos y productos en [src/data/care.ts](src/data/care.ts).
- **Reglas del mini diagnóstico:** [src/lib/quiz.ts](src/lib/quiz.ts).
- **Antes y después:** fotos en `dianamelocolorlab/antes-despues/` (ver el LEEME de esa carpeta) y textos en [src/data/before-after.ts](src/data/before-after.ts). La sección aparece sola cuando hay al menos una pareja.
- **Política de tratamiento de datos (Ley 1581 de 2012):** pendiente de publicar. Los formularios la mencionan.

## Archivos

| Archivo | Qué es |
|---|---|
| [src/app/api/agenda/route.ts](src/app/api/agenda/route.ts) | Turnos libres (`GET`) y reservas con fotos (`POST`) |
| [src/app/api/agenda/espera/route.ts](src/app/api/agenda/espera/route.ts) | Lista de espera |
| [src/app/api/cron/recordatorios/route.ts](src/app/api/cron/recordatorios/route.ts) | Recordatorios del día siguiente |
| [src/app/api/diana/route.ts](src/app/api/diana/route.ts) y [src/app/diana/](src/app/diana/) | Panel privado |
| [src/lib/agenda/google.ts](src/lib/agenda/google.ts) | Cliente de Google (OAuth o cuenta de servicio), sin dependencias |
| [src/lib/notify.ts](src/lib/notify.ts) | Correo (Resend) y WhatsApp Business |
| [src/components/sections/](src/components/sections/) | `Booking`, `PhotoPicker`, `Waitlist`, `Quiz`, `TryOn`, `BeforeAfter`, `Reviews` |
| [src/lib/tint.ts](src/lib/tint.ts) | Probador: detección de cabello (MediaPipe 1.2.2) y teñido |

Los datos de las clientas solo viven en el Calendar y el Drive de Diana: la web no tiene base de datos.
