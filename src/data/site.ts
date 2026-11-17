/** Datos de marca y contacto. Lo marcado POR CONFIRMAR debe validarlo Diana antes de publicar. */
export const site = {
  name: "Diana Melo Coiffure", // como en el logotipo aprobado
  shortName: "Diana Melo",
  role: "Colorista y estilista",
  instagram: { handle: "@dianamelocolorlab", url: "https://www.instagram.com/dianamelocolorlab/" },
  // WhatsApp de agendamiento, formato internacional sin + (57 = Colombia).
  // Si se deja vacío, todos los botones abren un mensaje directo de Instagram.
  whatsapp: { number: "573152593815" },
  // POR CONFIRMAR: ciudad deducida de las fotos de eventos (Hotel Estelar Villavicencio, Cluster Moda Orinoquía).
  city: "Villavicencio, Meta",
} as const;

export const nav = [
  { label: "Trabajos", href: "#trabajos" },
  { label: "Servicios", href: "#servicios" },
  { label: "Diana", href: "#diana" },
  { label: "Tu cita", href: "#tu-cita" },
  { label: "Olaplex", href: "#olaplex" },
] as const;

const defaultMessage = "Hola Diana, quiero agendar una cita.";

/**
 * Enlace de agendamiento con el mensaje ya escrito.
 * WhatsApp si hay número (el texto llega prellenado); si no, el chat de Instagram.
 */
export function bookingLink(message: string = defaultMessage): string {
  if (site.whatsapp.number) {
    return `https://wa.me/${site.whatsapp.number}?text=${encodeURIComponent(message)}`;
  }
  return "https://ig.me/m/dianamelocolorlab";
}

export const bookingChannel = site.whatsapp.number ? "WhatsApp" : "Instagram";
export const bookingHref = bookingLink();
