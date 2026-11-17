/** Datos de marca y contacto. Lo marcado POR CONFIRMAR debe validarlo Diana antes de publicar. */
export const site = {
  name: "Diana Melo Coiffé",
  shortName: "Diana Melo",
  role: "Colorista y estilista",
  instagram: { handle: "@dianamelocolorlab", url: "https://www.instagram.com/dianamelocolorlab/" },
  // POR CONFIRMAR: número de WhatsApp de agendamiento (formato internacional sin +).
  whatsapp: { number: "", message: "Hola Diana, quiero agendar una cita." },
  // POR CONFIRMAR: dirección, ciudad y horario. Las fotos de eventos apuntan a Villavicencio (Meta).
  address: { line1: "Dirección por confirmar", city: "Ciudad por confirmar" },
  hours: [
    { days: "Lunes a viernes", time: "Por confirmar" },
    { days: "Sábado", time: "Por confirmar" },
    { days: "Domingo", time: "Con cita previa" },
  ],
} as const;

export const nav = [
  { label: "Servicios", href: "#servicios" },
  { label: "Diana", href: "#diana" },
  { label: "Trabajos", href: "#trabajos" },
  { label: "Productos", href: "#productos" },
  { label: "Ubicación", href: "#ubicacion" },
] as const;

/** Enlace de agendamiento: WhatsApp si hay número, si no Instagram. */
export const bookingHref = site.whatsapp.number
  ? `https://wa.me/${site.whatsapp.number}?text=${encodeURIComponent(site.whatsapp.message)}`
  : site.instagram.url;
