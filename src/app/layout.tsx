import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Jost } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
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

export const metadata: Metadata = {
  title: "Diana Melo · Colorista en Villavicencio: balayage, rubios y cobrizos",
  description:
    "Estudio de Diana Melo, colorista y estilista en Colombia: balayage, rubios, decoloración y corrección de color, corte, peinado y maquillaje de novia. Agenda tu cita.",
};

export const viewport: Viewport = {
  themeColor: "#0B0B0C",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-CO" className={`${bodoni.variable} ${jost.variable}`}>
      <body>
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-gold focus:px-4 focus:py-3 focus:text-ink"
        >
          Saltar al contenido
        </a>
        <Header />
        <main id="contenido">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
