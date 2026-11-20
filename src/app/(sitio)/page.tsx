import { Hero } from "@/components/sections/Hero";
import { Work } from "@/components/sections/Work";
import { TryOn } from "@/components/sections/TryOn";
import { BeforeAfter } from "@/components/sections/BeforeAfter";
import { Services } from "@/components/sections/Services";
import { About } from "@/components/sections/About";
import { Process } from "@/components/sections/Process";
import { Reviews } from "@/components/sections/Reviews";
import { Olaplex } from "@/components/sections/Olaplex";
import { Quiz } from "@/components/sections/Quiz";
import { Contact } from "@/components/sections/Contact";

/**
 * Orden del argumento: quién es (hero) → lo que hace, probado (trabajos, probador, antes y después)
 * → qué ofrece (servicios) → por qué confiar (Diana, reseñas) → cómo es la cita → cómo cuida el cabello
 * (Olaplex) → qué te va (quiz) → agendar.
 * Antes y después y Reseñas solo aparecen cuando hay contenido real (fotos de Diana, perfil de Google).
 */
export default function Home() {
  return (
    <>
      <Hero />
      <Work />
      <TryOn />
      <BeforeAfter />
      <Services />
      <About />
      <Process />
      <Reviews />
      <Olaplex />
      <Quiz />
      <Contact />
    </>
  );
}
