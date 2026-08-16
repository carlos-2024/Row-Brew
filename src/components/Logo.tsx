type Props = {
  className?: string;
  /** Color del texto */
  tone?: "cream" | "ink" | "green";
  /** Muestra la cajita verde detrás, como en los posters */
  boxed?: boolean;
};

const TONES = {
  cream: "text-cream",
  ink: "text-ink",
  green: "text-roa-500",
} as const;

/**
 * Wordmark de Roa Brew: "ROA" grande con "BREW" debajo,
 * igual que el logo de los posters.
 */
export default function Logo({ className = "", tone = "cream", boxed = false }: Props) {
  const inner = (
    <span className={`flex flex-col leading-none ${TONES[tone]}`}>
      <span className="font-display text-[1.55em] tracking-tight">ROA</span>
      <span className="font-body text-[0.42em] font-bold tracking-[0.42em] pl-[0.15em]">
        BREW
      </span>
    </span>
  );

  if (!boxed) return <span className={className}>{inner}</span>;

  return (
    <span
      className={`inline-flex items-center justify-center rounded-2xl bg-roa-500 px-3 py-2 ${className}`}
    >
      <span className="text-cream">{inner}</span>
    </span>
  );
}

/** El perrito de la marca, en trazo simple. */
export function KodaMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden>
      <path
        d="M14 26c-3-9 1-16 4-15s5 6 5 6M50 26c3-9-1-16-4-15s-5 6-5 6"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M32 12c11 0 18 8 18 19s-8 21-18 21-18-10-18-21 7-19 18-19Z"
        stroke="currentColor"
        strokeWidth="3.5"
      />
      <circle cx="25" cy="30" r="2.6" fill="currentColor" />
      <circle cx="39" cy="30" r="2.6" fill="currentColor" />
      <path
        d="M32 37c-2.4 0-4 1.4-4 3s1.6 3 4 3 4-1.4 4-3-1.6-3-4-3Z"
        fill="currentColor"
      />
      <path
        d="M26 47c2 2 4 3 6 3s4-1 6-3"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
