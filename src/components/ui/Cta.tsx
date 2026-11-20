import type { ReactNode } from "react";

type Props = {
  href: string;
  children: ReactNode;
  /** gold: acción principal · ghost: hilo dorado, para la acción secundaria. */
  variant?: "gold" | "ghost";
  size?: "sm" | "md" | "lg";
  /** Icono propio (p. ej. WhatsApp); por defecto, una flecha. null = sin círculo. */
  icon?: ReactNode | null;
  /** Por defecto abre en otra pestaña si el enlace sale del sitio. */
  external?: boolean;
  className?: string;
  onClick?: () => void;
};

/**
 * Botón de la marca: píldora que se llena de luz al pasar y cuya flecha cruza el círculo.
 * Los estilos viven en globals.css (.cta) para que sirva igual en componentes de servidor y de cliente.
 */
export function Cta({ href, children, variant = "gold", size = "md", icon, external, className = "", onClick }: Props) {
  const out = external ?? /^https?:/.test(href);
  const glyph = icon === undefined ? <Arrow /> : icon;
  const cls = [
    "cta",
    variant === "ghost" ? "cta--ghost" : "",
    size === "lg" ? "cta--lg" : size === "sm" ? "cta--sm" : "",
    glyph === null ? "cta--plain" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <a href={href} className={cls} onClick={onClick} {...(out ? { target: "_blank", rel: "noopener" } : {})}>
      <span>{children}</span>
      {glyph !== null ? (
        <span aria-hidden className="cta-icon">
          {glyph}
          {glyph}
        </span>
      ) : null}
    </a>
  );
}

/** El mismo botón, para formularios. */
export function CtaButton({
  children,
  type = "button",
  disabled,
  onClick,
  icon,
  size = "md",
  className = "",
}: {
  children: ReactNode;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
  icon?: ReactNode;
  size?: "md" | "lg";
  className?: string;
}) {
  const glyph = icon ?? <Arrow />;
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`cta ${size === "lg" ? "cta--lg" : ""} disabled:pointer-events-none disabled:opacity-45 ${className}`}
    >
      <span>{children}</span>
      <span aria-hidden className="cta-icon">
        {glyph}
        {glyph}
      </span>
    </button>
  );
}

export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4.5 11.5 11.5 4.5M5.5 4.5h6v6" />
    </svg>
  );
}

export function ArrowSide({ dir = 1, className = "" }: { dir?: 1 | -1; className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
      style={dir < 0 ? { transform: "scaleX(-1)" } : undefined}
    >
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}
