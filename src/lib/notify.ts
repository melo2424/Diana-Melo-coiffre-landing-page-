/**
 * Avisos salientes, todos opcionales (si falta la variable, no hacen nada):
 *  - Correo con Resend: RESEND_API_KEY, RESEND_FROM, DIANA_EMAIL.
 *  - WhatsApp automático con la API de WhatsApp Business (Meta): WHATSAPP_TOKEN,
 *    WHATSAPP_PHONE_NUMBER_ID y plantillas aprobadas (WHATSAPP_TEMPLATE_*).
 */

const env = (k: string) => process.env[k]?.trim() || undefined;

export const emailEnabled = () => !!(env("RESEND_API_KEY") && env("RESEND_FROM"));
export const whatsappApiEnabled = () => !!(env("WHATSAPP_TOKEN") && env("WHATSAPP_PHONE_NUMBER_ID"));

export async function sendEmail(to: string, subject: string, text: string, html?: string) {
  if (!emailEnabled()) return false;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env("RESEND_API_KEY")}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: env("RESEND_FROM"), to: [to], subject, text, ...(html ? { html } : {}) }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
  return true;
}

/** Correo a Diana (si DIANA_EMAIL está configurado). */
export async function emailDiana(subject: string, text: string) {
  const to = env("DIANA_EMAIL");
  return to ? sendEmail(to, subject, text) : false;
}

/**
 * Envía una plantilla de WhatsApp aprobada por Meta.
 * `templateEnv` es el nombre de la variable que guarda el nombre de la plantilla.
 */
export async function sendWhatsAppTemplate(to: string, templateEnv: string, params: string[]) {
  const name = env(templateEnv);
  if (!whatsappApiEnabled() || !name) return false;
  const res = await fetch(`https://graph.facebook.com/v21.0/${env("WHATSAPP_PHONE_NUMBER_ID")}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${env("WHATSAPP_TOKEN")}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name,
        language: { code: env("WHATSAPP_TEMPLATE_LANG") ?? "es" },
        components: [{ type: "body", parameters: params.map((text) => ({ type: "text", text })) }],
      },
    }),
  });
  if (!res.ok) throw new Error(`WhatsApp ${res.status}: ${await res.text()}`);
  return true;
}
