type Props = {
  items: string[];
  className?: string;
  reverse?: boolean;
  /** Color del separador entre frases */
  dot?: string;
};

/**
 * Cinta infinita estilo poster. Duplica el contenido para el loop
 * continuo y se pausa al pasar el mouse.
 */
export default function Marquee({
  items,
  className = "",
  reverse = false,
  dot = "•",
}: Props) {
  const row = [...items, ...items];

  return (
    <div className={`marquee-mask overflow-hidden ${className}`}>
      <div className={reverse ? "marquee-track-rev" : "marquee-track"}>
        {row.map((item, i) => (
          <span
            key={i}
            className="flex shrink-0 items-center gap-6 whitespace-nowrap px-6"
          >
            <span>{item}</span>
            <span className="opacity-45">{dot}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
