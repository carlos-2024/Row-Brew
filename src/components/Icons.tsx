/**
 * Iconos en SVG inline.
 *
 * Antes esto eran emojis, pero dependen de la fuente del sistema: en Windows
 * los más nuevos (🧋 y compañía) salen como cuadrito vacío. En SVG se ven
 * igual en todos lados y heredan el color con `currentColor`.
 */

type IconProps = { className?: string };

// ───────────────────────── Marcas ─────────────────────────

export function WhatsAppIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.465 3.488" />
    </svg>
  );
}

export function InstagramIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 0 1-2.88 0 1.44 1.44 0 0 1 2.88 0z" />
    </svg>
  );
}

export function TikTokIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

// ───────────────────────── Interfaz ─────────────────────────

const S = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Vaso de bubble tea — reemplaza al emoji 🧋 */
export function BobaIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...S} aria-hidden>
      <path d="M5.5 7h13l-1.3 12.2A2.6 2.6 0 0 1 14.6 21H9.4a2.6 2.6 0 0 1-2.6-1.8L5.5 7Z" />
      <path d="M4 5.4h16v1.4H4z" fill="currentColor" stroke="none" />
      <path d="M15.5 5.4 17 1.8" />
      <circle cx="10" cy="17" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="13.6" cy="18" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="11.9" cy="14.4" r="1.15" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Vaso con burbujas — sparkling tea */
export function SparklingIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...S} aria-hidden>
      <path d="M6 6h12l-1.2 13A2.4 2.4 0 0 1 14.4 21H9.6A2.4 2.4 0 0 1 7.2 19L6 6Z" />
      <circle cx="10.2" cy="11" r="1" />
      <circle cx="13.6" cy="13.4" r="1.2" />
      <circle cx="10.6" cy="15.8" r="1.3" />
      <path d="M9 3.2 9.7 5M15 3.2 14.3 5M12 2.4V4.6" />
    </svg>
  );
}

/** Hoja de té — matcha */
export function MatchaIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...S} aria-hidden>
      <path d="M4 20c0-7.5 5-13 16-14 .8 8.5-4 14-11 14H4Z" />
      <path d="M4 20c4.5-4.2 8.2-6.8 13.2-9.2" />
    </svg>
  );
}

/** Vaso de café frío — cold brew */
export function ColdBrewIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...S} aria-hidden>
      <path d="M6 7h12l-1.1 12.1A2.5 2.5 0 0 1 14.4 21H9.6a2.5 2.5 0 0 1-2.5-1.9L6 7Z" />
      <path d="M6.6 11.5h10.8" />
      <path d="M9.5 4.6c0-1 1-1.4 1-2.4M12.5 4.6c0-1 1-1.4 1-2.4M15.5 4.6c0-1 1-1.4 1-2.4" />
    </svg>
  );
}

/** Torta de cumpleaños */
export function CakeIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...S} aria-hidden>
      <path d="M3.5 21h17v-6.2a2.3 2.3 0 0 0-2.3-2.3H5.8a2.3 2.3 0 0 0-2.3 2.3V21Z" />
      <path d="M3.5 16.4c1.4 0 1.4 1.3 2.8 1.3s1.4-1.3 2.8-1.3 1.4 1.3 2.9 1.3 1.4-1.3 2.8-1.3 1.4 1.3 2.8 1.3 1.4-1.3 2.9-1.3" />
      <path d="M8 12.5V9.6M12 12.5V9.6M16 12.5V9.6" />
      <path d="M8 7.4c0-1 1-1.3 1-2.3M12 7.4c0-1 1-1.3 1-2.3M16 7.4c0-1 1-1.3 1-2.3" />
    </svg>
  );
}

export function SearchIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...S} aria-hidden>
      <circle cx="10.8" cy="10.8" r="6.8" />
      <path d="m20 20-4.4-4.4" />
    </svg>
  );
}

export function TrashIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...S} aria-hidden>
      <path d="M4 6.5h16M9.5 6.5V4.8A1.3 1.3 0 0 1 10.8 3.5h2.4a1.3 1.3 0 0 1 1.3 1.3v1.7" />
      <path d="M6.4 6.5 7.4 19.6A1.9 1.9 0 0 0 9.3 21.4h5.4a1.9 1.9 0 0 0 1.9-1.8l1-13.1" />
      <path d="M10.5 10.5v6.5M13.5 10.5v6.5" />
    </svg>
  );
}

export function StoreIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...S} aria-hidden>
      <path d="M3.5 9.5V20a1 1 0 0 0 1 1h15a1 1 0 0 0 1-1V9.5" />
      <path d="M2.5 9.5 4.6 4a1 1 0 0 1 .9-.6h13a1 1 0 0 1 .9.6l2.1 5.5a2.9 2.9 0 0 1-5 2 2.9 2.9 0 0 1-5 0 2.9 2.9 0 0 1-5 0 2.9 2.9 0 0 1-5-2Z" />
      <path d="M9.5 21v-5.5h5V21" />
    </svg>
  );
}

export function ScooterIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...S} aria-hidden>
      <circle cx="5" cy="17.5" r="3" />
      <circle cx="19" cy="17.5" r="3" />
      <path d="M8 17.5h8M19 14.5V8a3 3 0 0 0-3-3h-1.5" />
      <path d="m5 14.5 3.5-8h3" />
    </svg>
  );
}

export function PartyIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...S} aria-hidden>
      <path d="M3 21l4.5-11.5L15 17 3 21Z" />
      <path d="M13.5 9.5A4 4 0 0 1 16 5.5M17 12a4 4 0 0 1 4-2.5M14.5 4.5l.5-2M20.5 6.5l1.7-1M19 15.5l2 .8" />
    </svg>
  );
}

export function PinIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...S} aria-hidden>
      <path d="M12 21.5s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
      <circle cx="12" cy="10.2" r="2.6" />
    </svg>
  );
}

export function ClockIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...S} aria-hidden>
      <circle cx="12" cy="12" r="8.8" />
      <path d="M12 7v5.3l3.3 2" />
    </svg>
  );
}

export function SlidersIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...S} aria-hidden>
      <path d="M5 21v-6M5 11V3M12 21v-9M12 8V3M19 21v-4M19 13V3" />
      <path d="M2.5 15h5M9.5 12h5M16.5 17h5" />
    </svg>
  );
}

export function SproutIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...S} aria-hidden>
      <path d="M12 21v-8" />
      <path d="M12 13C12 9 9 6.5 4.5 6.5 4.5 11 7.5 13 12 13Z" />
      <path d="M12 13c0-3.4 2.6-5.6 6.5-5.6C18.5 11.2 15.9 13 12 13Z" />
    </svg>
  );
}

export function PawIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...S} aria-hidden>
      <ellipse cx="6.2" cy="9.6" rx="2.1" ry="2.7" />
      <ellipse cx="17.8" cy="9.6" rx="2.1" ry="2.7" />
      <ellipse cx="10" cy="5.4" rx="1.9" ry="2.5" />
      <ellipse cx="14" cy="5.4" rx="1.9" ry="2.5" />
      <path d="M12 12.4c3 0 5.2 2.2 5.2 4.6 0 2-1.6 3.4-3.6 3.4-1 0-1.2-.4-1.6-.4s-.6.4-1.6.4c-2 0-3.6-1.4-3.6-3.4 0-2.4 2.2-4.6 5.2-4.6Z" />
    </svg>
  );
}

export function ChartIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...S} aria-hidden>
      <path d="M4 20h16" />
      <path d="M6.5 20v-6M11.5 20V6M16.5 20v-9" />
    </svg>
  );
}

export function ReceiptIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...S} aria-hidden>
      <path d="M5 21V4.2a.7.7 0 0 1 1.1-.6L8 4.9l1.9-1.3a.7.7 0 0 1 .8 0L12.6 4.9l1.9-1.3a.7.7 0 0 1 .8 0L17.2 4.9l1.7-1.3a.7.7 0 0 1 1.1.6V21l-2.4-1.4-2.3 1.4-2.4-1.4-2.3 1.4-2.4-1.4L5 21Z" />
      <path d="M8.5 9h7M8.5 13h4.5" />
    </svg>
  );
}

export function FolderIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...S} aria-hidden>
      <path d="M3.5 19V6.5a1.5 1.5 0 0 1 1.5-1.5h3.8a1.5 1.5 0 0 1 1.2.6l1 1.4h7.5A1.5 1.5 0 0 1 20 8.5V19a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19Z" />
    </svg>
  );
}

export function TagIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...S} aria-hidden>
      <path d="M11.6 3.5H19a1.5 1.5 0 0 1 1.5 1.5v7.4a1.5 1.5 0 0 1-.45 1.06l-7.1 7.1a1.5 1.5 0 0 1-2.12 0l-6.9-6.9a1.5 1.5 0 0 1 0-2.12l6.7-6.7a1.5 1.5 0 0 1 1.06-.44Z" />
      <circle cx="16" cy="8" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function GearIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...S} aria-hidden>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19.4 14.5a1.6 1.6 0 0 0 .32 1.77l.06.06a1.9 1.9 0 1 1-2.7 2.7l-.05-.06a1.6 1.6 0 0 0-1.77-.32 1.6 1.6 0 0 0-1 1.46v.17a1.9 1.9 0 1 1-3.8 0v-.09a1.6 1.6 0 0 0-1.05-1.46 1.6 1.6 0 0 0-1.77.32l-.06.06a1.9 1.9 0 1 1-2.7-2.7l.06-.05a1.6 1.6 0 0 0 .32-1.77 1.6 1.6 0 0 0-1.46-1H3.6a1.9 1.9 0 1 1 0-3.8h.09a1.6 1.6 0 0 0 1.46-1.05 1.6 1.6 0 0 0-.32-1.77l-.06-.06a1.9 1.9 0 1 1 2.7-2.7l.05.06a1.6 1.6 0 0 0 1.77.32h.08a1.6 1.6 0 0 0 1-1.46V3.6a1.9 1.9 0 1 1 3.8 0v.09a1.6 1.6 0 0 0 1 1.46 1.6 1.6 0 0 0 1.77-.32l.06-.06a1.9 1.9 0 1 1 2.7 2.7l-.06.05a1.6 1.6 0 0 0-.32 1.77v.08a1.6 1.6 0 0 0 1.46 1h.17a1.9 1.9 0 1 1 0 3.8h-.09a1.6 1.6 0 0 0-1.46 1Z" />
    </svg>
  );
}

export function ExternalIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...S} aria-hidden>
      <path d="M9 5H5.5A1.5 1.5 0 0 0 4 6.5v12A1.5 1.5 0 0 0 5.5 20h12a1.5 1.5 0 0 0 1.5-1.5V15" />
      <path d="M14 4h6v6M20 4l-8.5 8.5" />
    </svg>
  );
}

export function PowerIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...S} aria-hidden>
      <path d="M12 3v9" />
      <path d="M7 6.3a8 8 0 1 0 10 0" />
    </svg>
  );
}

// ───────────────────────── Categorías ─────────────────────────

const CATEGORY_ICONS: Record<string, (p: IconProps) => React.JSX.Element> = {
  "sparkling-tea": SparklingIcon,
  matcha: MatchaIcon,
  "cold-brew": ColdBrewIcon,
  "milk-tea": BobaIcon,
};

/**
 * Icono de una familia de bebidas. Las categorías nuevas creadas desde el
 * panel caen al vaso genérico, así que nunca queda un hueco.
 */
export function CategoryIcon({
  slug,
  className = "",
}: {
  slug: string;
  className?: string;
}) {
  const Icon = CATEGORY_ICONS[slug] ?? BobaIcon;
  return <Icon className={className} />;
}
