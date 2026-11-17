import { Hero } from "@/components/sections/Hero";
import { Work } from "@/components/sections/Work";
import { Services } from "@/components/sections/Services";
import { About } from "@/components/sections/About";
import { Process } from "@/components/sections/Process";
import { Olaplex } from "@/components/sections/Olaplex";
import { Contact } from "@/components/sections/Contact";

/**
 * Orden del argumento: quién es (hero) → lo que hace, probado (trabajos) → qué ofrece (servicios)
 * → por qué confiar (Diana) → cómo es la cita → con qué cuida el cabello (Olaplex) → agendar.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <Work />
      <Services />
      <About />
      <Process />
      <Olaplex />
      <Contact />
    </>
  );
}
