# Agenda de diagnósticos

La sección **Agenda tu diagnóstico** (`#agendar`) reserva una cita de diagnóstico de 30 minutos. El evento queda en el **Google Calendar de Diana**, y la clienta le confirma por **WhatsApp** con un mensaje que ya va escrito.

## Cómo funciona

1. La clienta elige **día y hora**. Solo aparecen los turnos que están libres en el calendario de Diana.
2. Deja **sus datos**: nombre, WhatsApp, correo (opcional), qué se quiere hacer, cómo tiene el cabello hoy, notas y la autorización de datos (Ley 1581 de 2012).
3. La web crea el evento **«Diagnóstico · Nombre»** en el calendario, en color amarillo. La descripción trae todos sus datos y un enlace `wa.me` para escribirle con un toque.
4. La clienta pulsa **«Confirmar por WhatsApp»**. A Diana le llega el mensaje con la fecha, el servicio y el estado del cabello. La clienta también puede guardar la cita en su propio calendario.

Antes de crear el evento, la web vuelve a revisar que el horario siga libre. Así se evitan dos reservas a la misma hora.

**Modo solicitud.** Mientras no estén las credenciales de Google, la agenda usa el horario base sin consultar el calendario. Al final, la clienta envía la solicitud por WhatsApp y Diana confirma a mano.

## Conectar el Google Calendar de Diana (una sola vez, unos 10 minutos)

1. Entra a <https://console.cloud.google.com/> con cualquier cuenta de Google y crea un proyecto, por ejemplo «Agenda Diana Melo».
2. Ve a **APIs y servicios → Biblioteca**, busca **Google Calendar API** y pulsa **Habilitar**.
3. Ve a **APIs y servicios → Credenciales → Crear credenciales → Cuenta de servicio**. Ponle un nombre, por ejemplo `agenda-web`, y crea la cuenta. No hace falta darle roles.
4. Abre la cuenta de servicio y ve a **Claves → Agregar clave → JSON**. Se descarga un archivo; guárdalo en un lugar seguro.
5. Ahora, **con la cuenta de Google de Diana**, entra a Google Calendar → ⚙ Configuración → elige su calendario → **Compartir con personas específicas** → agrega el `client_email` del JSON con el permiso **«Hacer cambios en eventos»**.
6. Copia `.env.example` a `.env.local` y llena:
   - `GOOGLE_CLIENT_EMAIL`: el `client_email` del JSON.
   - `GOOGLE_PRIVATE_KEY`: el `private_key` del JSON, entre comillas dobles, con los `\n` tal cual.
   - `GOOGLE_CALENDAR_ID`: el correo de Gmail de Diana, si es su calendario principal.
7. Reinicia `npm run dev`. `GET /api/agenda` debe responder `"mode":"calendar"`.

En producción (Vercel u otro hosting), las mismas tres variables van en la configuración de entorno del proyecto.

## Ajustes

Están en [src/lib/agenda/config.ts](src/lib/agenda/config.ts), **POR CONFIRMAR con Diana**:

| Ajuste | Valor actual |
|---|---|
| Horario | Lunes a viernes de 9:00 a 18:00, sábado de 9:00 a 14:00, domingo cerrado |
| Duración del diagnóstico | 30 min, un turno cada 30 min |
| Anticipación mínima | 3 horas |
| Días hacia adelante | 21 |
| Opciones de servicio y de estado del cabello | `services` y `hairStates` |

Para bloquear un día u hora, Diana solo tiene que crear un evento en su calendario. La web lo ve ocupado.

## Archivos

- [src/app/api/agenda/route.ts](src/app/api/agenda/route.ts): `GET` devuelve los turnos libres; `POST` valida y crea el evento.
- [src/lib/agenda/google.ts](src/lib/agenda/google.ts): cliente de Google Calendar con cuenta de servicio, sin dependencias.
- [src/lib/agenda/slots.ts](src/lib/agenda/slots.ts): genera los turnos y descuenta los ocupados.
- [src/lib/agenda/format.ts](src/lib/agenda/format.ts): fechas en español, número de celular, mensaje de WhatsApp y enlace para guardar en calendario.
- [src/components/sections/Booking.tsx](src/components/sections/Booking.tsx): el formulario en tres pasos.

## Datos y privacidad

Los datos de la clienta **solo se guardan en el evento del calendario de Diana**: la web no tiene base de datos. El formulario pide autorización expresa según la Ley 1581 de 2012. Diana debería tener publicada una política de tratamiento de datos (**pendiente**).
