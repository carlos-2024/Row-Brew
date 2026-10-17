/**
 * Adornos del modo Halloween: telarañas en las esquinas y murciélagos.
 *
 * Va en el layout del sitio y no en cada sección, así la temporada se nota
 * en toda la página —carta, promos, fidelidad— y no solo en la portada.
 *
 * Todo es decorativo: no recibe clics (para no tapar botones), queda detrás
 * del contenido y está oculto para los lectores de pantalla. Las telarañas
 * son fijas a la ventana; los murciélagos solo acompañan la primera pantalla,
 * que es donde hay cielo libre para que se vean.
 */

/** Telaraña de esquina. Se dibuja para la esquina superior izquierda. */
function Telarana({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden>
      {/* Trazo grueso a propósito: el fondo verde tiene grano y una telaraña
          fina se perdía del todo */}
      <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
        {/* Radios */}
        <path d="M0 0 0 118M0 0 30 114M0 0 68 102M0 0 102 68M0 0 114 30M0 0 118 0" />
        {/* Hilos en arco, cada vuelta más abierta */}
        <path d="M26 0A26 26 0 0 1 0 26" />
        <path d="M52 0A52 52 0 0 1 0 52" />
        <path d="M80 0A80 80 0 0 1 0 80" />
        <path d="M108 0A108 108 0 0 1 0 108" />
      </g>
    </svg>
  );
}

function Murcielago({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg viewBox="0 0 64 28" className={className} style={style} aria-hidden>
      <path
        fill="currentColor"
        d="M32 6c2.4 0 4 1.9 4 4.3 0 .6-.1 1.1-.3 1.6 2.3-.4 3.6-2 5.5-4.6 2.3-3.1 5.6-5.3 9.9-5.3-1.4 1.8-1.6 3.6-1.2 5.4.6-.6 1.6-1.2 3-1.4-1 1.4-1.3 2.8-1 4.2 1.6 6.6 6.3 9.2 12.1 9.6-5.6 1.3-9.2 2.9-12.3 5.3-2.6 2-5.3 3-8 2.4-2.4-.5-4-2-5.3-3.9-1.5-2.2-3.4-3.6-6.4-3.6s-4.9 1.4-6.4 3.6c-1.3 1.9-2.9 3.4-5.3 3.9-2.7.6-5.4-.4-8-2.4C9.2 22.7 5.6 21.1 0 19.8c5.8-.4 10.5-3 12.1-9.6.3-1.4 0-2.8-1-4.2 1.4.2 2.4.8 3 1.4.4-1.8.2-3.6-1.2-5.4 4.3 0 7.6 2.2 9.9 5.3 1.9 2.6 3.2 4.2 5.5 4.6-.2-.5-.3-1-.3-1.6C28 7.9 29.6 6 32 6Z"
      />
    </svg>
  );
}

/** Posición, tamaño y ritmo de cada murciélago. Desordenados a propósito. */
const MURCIELAGOS = [
  { clase: "left-[6%] top-[18%] w-14 opacity-70", retraso: "0s", duracion: "4.2s" },
  { clase: "left-[22%] top-[9%] w-9 opacity-50", retraso: "0.8s", duracion: "3.4s" },
  { clase: "right-[12%] top-[14%] w-16 opacity-65", retraso: "0.4s", duracion: "4.8s" },
  { clase: "right-[30%] top-[6%] w-8 opacity-45", retraso: "1.4s", duracion: "3.1s" },
  { clase: "left-[44%] top-[26%] w-7 opacity-35", retraso: "2s", duracion: "5.2s" },
];

export default function HalloweenDecor() {
  return (
    <>
      {/* Telarañas: fijas, así siguen en las esquinas al bajar por la página.
          Arriba a la izquierda no va ninguna: ahí está el logo y la tapaba. */}
      <div className="pointer-events-none fixed inset-0 z-[5] select-none" aria-hidden>
        {/* Más chicas en el teléfono: ahí la esquina de arriba la comparten el
            carrito y el menú, y una telaraña grande los ensucia */}
        <Telarana className="absolute -right-3 -top-3 h-20 w-20 -scale-x-100 text-cream/40 sm:h-44 sm:w-44 sm:text-cream/45" />
        <Telarana className="absolute -bottom-3 -left-3 h-16 w-16 -scale-y-100 text-cream/30 sm:h-32 sm:w-32 sm:text-cream/35" />
      </div>

      {/* Murciélagos: solo sobre la primera pantalla */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-dvh select-none overflow-hidden"
        aria-hidden
      >
        {MURCIELAGOS.map((m) => (
          <Murcielago
            key={m.clase}
            className={`absolute text-ink/70 ${m.clase}`}
            // En línea porque cada uno lleva su propio ritmo: con clases de
            // Tailwind harían falta cinco variantes para lo mismo
            style={{
              animation: `aletear ${m.duracion} ease-in-out ${m.retraso} infinite`,
            }}
          />
        ))}
      </div>
    </>
  );
}
