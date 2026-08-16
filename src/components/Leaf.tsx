/** Hoja de monstera — la textura botánica de los posters de la marca. */
export default function Leaf({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 200 220"
      className={className}
      style={style}
      fill="currentColor"
      aria-hidden
    >
      <path d="M100 218c-2-46-4-70-12-96C77 86 55 66 28 56c-6-2-8-6-4-9 14-11 34-14 52-8 3 1 4 0 4-3-2-14 4-27 17-34 3-2 6-1 7 2 5 15 16 24 31 27 3 1 4 3 3 6-6 16-3 31 8 43 2 3 1 6-2 6-14 3-24 11-30 24-1 3 0 5 3 5 16 2 29 11 36 26 1 3-1 6-4 5-19-3-35 2-46 15-9 10-13 27-14 57-.1 3-2 5-5 5s-4-2-4-5Z" />
      <path
        d="M100 214c0-40 6-72 18-96"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        opacity="0.35"
      />
    </svg>
  );
}

/** Estrella de 4 puntas — el destello de los posters. */
export function Sparkle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="currentColor" aria-hidden>
      <path d="M20 0c1.5 11.5 8.5 18.5 20 20-11.5 1.5-18.5 8.5-20 20-1.5-11.5-8.5-18.5-20-20C11.5 18.5 18.5 11.5 20 0Z" />
    </svg>
  );
}

/** Ola divisoria entre secciones. */
export function WaveDivider({
  className = "",
  flip = false,
}: {
  className?: string;
  flip?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 1440 90"
      preserveAspectRatio="none"
      className={className}
      style={flip ? { transform: "scaleY(-1)" } : undefined}
      fill="currentColor"
      aria-hidden
    >
      <path d="M0 44c120-30 240-44 360-30s240 56 360 60 240-28 360-46 240-16 360 6v56H0V44Z" />
    </svg>
  );
}
