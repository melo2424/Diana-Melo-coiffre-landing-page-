import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Variant = "primary" | "quiet";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-none font-sans font-medium tracking-[0.01em] " +
  "transition-[background-color,color,transform] duration-[var(--dur-fast)] ease-[var(--ease-out)] " +
  "active:translate-y-px select-none whitespace-nowrap";

const variants: Record<Variant, string> = {
  // Único elemento claro sólido de la página: el dorado.
  primary: "bg-accent text-on-accent hover:bg-gold-light",
  // Enlace de texto con subrayado que crece. Sin bordes.
  quiet:
    "text-text underline decoration-gold/60 decoration-1 underline-offset-[6px] hover:decoration-gold hover:text-gold-light",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-[0.9375rem]", // 44px: objetivo táctil mínimo
  lg: "h-14 px-7 text-body", // 56px
};

type Props = {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
} & ComponentPropsWithoutRef<"a">;

/** Siempre un enlace: el sitio no tiene formularios propios, agenda por WhatsApp/Instagram. */
export function Button({ variant = "primary", size = "md", className = "", children, ...rest }: Props) {
  const sizeClass = variant === "quiet" ? "h-11 text-body" : sizes[size];
  return (
    <a className={`${base} ${variants[variant]} ${sizeClass} ${className}`} {...rest}>
      {children}
    </a>
  );
}
