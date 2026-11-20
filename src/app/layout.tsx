import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Bodoni_Moda, Jost } from "next/font/google";
import { site } from "@/data/site";
import { agenda } from "@/lib/agenda/config";
import "./globals.css";

// Didone de alto contraste: el mismo linaje que el monograma "DM" de las batas del estudio.
const bodoni = Bodoni_Moda({
  subsets: ["latin", "latin-ext"],
  weight: "variable",
  axes: ["opsz"],
  variable: "--font-bodoni",
  display: "swap",
});

// Geométrica de herencia Futura: el par clásico de las revistas de moda con Bodoni.
const jost = Jost({
  subsets: ["latin", "latin-ext"],
  weight: "variable",
  variable: "--font-jost",
  display: "swap",
});

const title = "Diana Melo · Colorista en Villavicencio: balayage, rubios y cobrizos";
const description =
  "Estudio de Diana Melo, colorista y estilista en Colombia: balayage, rubios, decoloración y corrección de color, corte, peinado y maquillaje de novia. Agenda tu diagnóstico.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: title, template: "%s · Diana Melo" },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: site.name,
    title,
    description,
    images: [{ url: "/images/marca/banner-rubio-980.webp", width: 980, alt: "Diana Melo Coiffure" }],
  },
  twitter: { card: "summary_large_image", title, description },
};

export const viewport: Viewport = {
  themeColor: "#0B0B0C",
  colorScheme: "dark",
};

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Ficha del salón para Google (resultados locales y mapas). */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HairSalon",
  name: site.name,
  url: site.url,
  image: `${site.url}/images/marca/banner-rubio-980.webp`,
  ...(site.whatsapp.number ? { telephone: `+${site.whatsapp.number}` } : {}),
  address: {
    "@type": "PostalAddress",
    ...(site.address ? { streetAddress: site.address } : {}),
    addressLocality: "Villavicencio",
    addressRegion: "Meta",
    addressCountry: "CO",
  },
  sameAs: [site.instagram.url],
  openingHoursSpecification: Object.entries(agenda.hours)
    .filter(([, spans]) => spans.length)
    .map(([d, spans]) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: `https://schema.org/${days[Number(d)]}`,
      opens: spans[0][0],
      closes: spans[spans.length - 1][1],
    })),
};

const plausible = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-CO" data-scroll-behavior="smooth" className={`${bodoni.variable} ${jost.variable}`}>
      <body>
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {children}
        {plausible ? (
          <>
            <Script id="plausible-queue" strategy="afterInteractive">
              {`window.plausible=window.plausible||function(){(window.plausible.q=window.plausible.q||[]).push(arguments)}`}
            </Script>
            <Script
              defer
              data-domain={plausible}
              src={process.env.NEXT_PUBLIC_PLAUSIBLE_SRC || "https://plausible.io/js/script.js"}
              strategy="afterInteractive"
            />
          </>
        ) : null}
      </body>
    </html>
  );
}
