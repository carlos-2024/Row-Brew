/**
 * Adornos del modo Halloween.
 *
 * Va en el layout del sitio y no en cada sección, así la temporada se nota
 * en toda la página —carta, promos, fidelidad— y no solo en la portada.
 *
 * Todo vive en los bordes de la pantalla a propósito. Estas capas van por
 * encima del contenido, así que cualquier cosa puesta en el medio taparía
 * un título o un precio; en las esquinas y en el cielo de la portada hay
 * sitio de sobra y nada estorba.
 *
 * Nada de esto recibe clics y todo está oculto para los lectores de
 * pantalla: es decoración, no información. Las animaciones son de CSS, así
 * que quien tenga activado "reducir movimiento" las ve quietas sin que haya
 * que hacer nada: globals.css ya corta el movimiento en todo el sitio.
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

/** Fantasma de sábana, con el borde inferior ondulado. */
function Fantasma({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg viewBox="0 0 40 52" className={className} style={style} aria-hidden>
      <path
        fill="currentColor"
        d="M20 1c10.5 0 19 8.5 19 19v30c0 1.6-1.9 2.4-3 1.2l-3.4-3.6a2 2 0 0 0-2.9 0l-3.3 3.5a2 2 0 0 1-2.9 0l-3.3-3.5a2 2 0 0 0-2.9 0l-3.3 3.5a2 2 0 0 1-2.9 0l-3.4-3.6c-1.1-1.2-3-.4-3 1.2V20C1 9.5 9.5 1 20 1Z"
      />
      <g fill="#0c100b" opacity="0.75">
        <ellipse cx="13.5" cy="20" rx="3.1" ry="4" />
        <ellipse cx="26.5" cy="20" rx="3.1" ry="4" />
        <ellipse cx="20" cy="31" rx="3.4" ry="4.6" />
      </g>
    </svg>
  );
}

/** Calabaza tallada. La llama se dibuja aparte para poder hacerla titilar. */
function Calabaza({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 72 64" className={className} aria-hidden>
      <path
        d="M33 14c-2-6-6-9-11-10 4-2 9-1 12 2 2-3 5-4 8-3-2 2-3 5-3 8"
        fill="none"
        stroke="#3f6b2e"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Tres lóbulos: el del medio por encima, como una calabaza real */}
      <ellipse cx="20" cy="39" rx="17" ry="23" fill="currentColor" opacity="0.82" />
      <ellipse cx="52" cy="39" rx="17" ry="23" fill="currentColor" opacity="0.82" />
      <ellipse cx="36" cy="39" rx="21" ry="24" fill="currentColor" />
      <g
        fill="#0c100b"
        style={{ animation: "titilar 3.6s ease-in-out infinite" }}
      >
        <path d="M22 31l9 6-9 4z" />
        <path d="M50 31l-9 6 9 4z" />
        <path d="M23 46c4 1 9 1.5 13 1.5S45 47 49 46c-1.5 5-6.5 8.5-13 8.5S24.5 51 23 46Zm7 2.6 1.6 2.8 1.7-2.5Zm10.5-.2-1.4 2.7 2.8-2.4Z" />
      </g>
    </svg>
  );
}

/** Dónde y a qué ritmo aletea cada murciélago quieto del cielo. */
const QUIETOS = [
  { clase: "left-[6%] top-[18%] w-14 opacity-70", retraso: "0s", duracion: "4.2s" },
  { clase: "left-[22%] top-[9%] w-9 opacity-50", retraso: "0.8s", duracion: "3.4s" },
  { clase: "right-[12%] top-[14%] w-16 opacity-65", retraso: "0.4s", duracion: "4.8s" },
  { clase: "right-[30%] top-[6%] w-8 opacity-45", retraso: "1.4s", duracion: "3.1s" },
  { clase: "left-[44%] top-[26%] w-7 opacity-35", retraso: "2s", duracion: "5.2s" },
];

/** Los que cruzan la pantalla entera. Pocos y espaciados: uno cada tanto. */
const CRUZAN = [
  { top: "7%", ancho: "w-10", retraso: "2s", duracion: "17s" },
  { top: "21%", ancho: "w-6", retraso: "11s", duracion: "23s" },
];

/** Calabazas colgadas del borde superior, con hilos de distinto largo. */
const COLGADAS = [
  { clase: "left-[30%] w-10 sm:w-14", hilo: "2.5rem", retraso: "0s", duracion: "6s" },
  { clase: "right-[22%] w-8 sm:w-11", hilo: "4.5rem", retraso: "1.6s", duracion: "7.5s" },
];

/** Fantasmas que suben por los márgenes, donde no hay texto que tapar. */
const FANTASMAS = [
  { clase: "left-[3%] bottom-0 w-10", retraso: "1s", duracion: "16s" },
  { clase: "right-[6%] bottom-0 w-7", retraso: "9s", duracion: "21s" },
];

export default function HalloweenDecor() {
  return (
    <>
      {/* ── Fijos a la ventana: acompañan toda la página ── */}
      <div className="pointer-events-none fixed inset-0 z-[5] select-none" aria-hidden>
        {/* Telarañas. Arriba a la izquierda no va ninguna: ahí está el logo.
            Más chicas en el teléfono, donde esa esquina la comparten el
            carrito y el menú. */}
        <Telarana className="absolute -right-3 -top-3 h-20 w-20 -scale-x-100 text-cream/40 sm:h-44 sm:w-44 sm:text-cream/45" />
        <Telarana className="absolute -bottom-3 -left-3 h-16 w-16 -scale-y-100 text-cream/30 sm:h-32 sm:w-32 sm:text-cream/35" />

        {/* Niebla al ras del piso. Son dos cintas del doble de ancho que se
            corren media cinta: como el dibujo se repite, el ciclo no se nota.
            La de atrás va más lenta y da sensación de profundidad. */}
        <div className="absolute inset-x-0 bottom-0 h-32 overflow-hidden sm:h-44">
          <div
            className="absolute bottom-0 left-0 h-full w-[200%] opacity-30"
            style={{
              animation: "niebla 46s linear infinite",
              background:
                "radial-gradient(60% 100% at 10% 100%, #dbebd6 0%, transparent 70%)," +
                "radial-gradient(50% 95% at 32% 100%, #dbebd6 0%, transparent 72%)," +
                "radial-gradient(55% 100% at 58% 100%, #dbebd6 0%, transparent 70%)," +
                "radial-gradient(45% 90% at 84% 100%, #dbebd6 0%, transparent 74%)",
            }}
          />
          <div
            className="absolute bottom-0 left-0 h-2/3 w-[200%] opacity-40"
            style={{
              animation: "niebla 29s linear infinite",
              background:
                "radial-gradient(55% 100% at 20% 100%, #f5f1e4 0%, transparent 72%)," +
                "radial-gradient(48% 95% at 46% 100%, #f5f1e4 0%, transparent 74%)," +
                "radial-gradient(52% 100% at 72% 100%, #f5f1e4 0%, transparent 72%)",
            }}
          />
        </div>
      </div>

      {/* ── Solo sobre la primera pantalla, que es donde hay cielo ── */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-dvh select-none overflow-hidden"
        aria-hidden
      >
        {/* Araña colgando de su hilo. El hilo y la araña van juntos en el
            mismo bloque para que bajen como una sola cosa. */}
        <div
          className="absolute left-[54%] top-0 flex flex-col items-center sm:left-[48%]"
          style={{ animation: "colgar 14s ease-in-out 3s infinite" }}
        >
          <span className="block h-20 w-px bg-cream/40 sm:h-28" />
          <svg viewBox="0 0 40 34" className="w-7 text-ink/80 sm:w-9" aria-hidden>
            <g stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" fill="none">
              <path d="M16 15 4 7M16 19 3 19M16 23 5 31M24 15 36 7M24 19 37 19M24 23 35 31" />
            </g>
            <ellipse cx="20" cy="20" rx="8" ry="9" fill="currentColor" />
            <circle cx="20" cy="11" r="5" fill="currentColor" />
            <circle cx="18" cy="10" r="1.4" fill="#f07818" />
            <circle cx="22" cy="10" r="1.4" fill="#f07818" />
          </svg>
        </div>

        {/* Calabazas colgadas del borde de arriba, como la araña.
            En las esquinas de abajo no caben: ahí están las estadísticas del
            hero a la izquierda y el botón de WhatsApp a la derecha, y una
            calabaza sentada les tapaba el texto. Colgando usan la franja de
            cielo, que está libre en todas las pantallas. */}
        {COLGADAS.map((c) => (
          <div
            key={c.clase}
            className={`absolute top-0 flex origin-top flex-col items-center ${c.clase}`}
            style={{ animation: `wiggle ${c.duracion} ease-in-out ${c.retraso} infinite` }}
          >
            <span className="block w-px bg-cream/35" style={{ height: c.hilo }} />
            <Calabaza className="w-full text-mango drop-shadow-[2px_3px_0_rgba(12,16,11,0.4)]" />
          </div>
        ))}


        {QUIETOS.map((m) => (
          <Murcielago
            key={m.clase}
            className={`absolute text-ink/70 ${m.clase}`}
            // En línea porque cada uno lleva su propio ritmo: con clases de
            // Tailwind harían falta cinco variantes para lo mismo
            style={{ animation: `aletear ${m.duracion} ease-in-out ${m.retraso} infinite` }}
          />
        ))}

        {CRUZAN.map((m) => (
          <Murcielago
            key={m.top}
            className={`absolute left-0 text-ink/75 ${m.ancho}`}
            style={{
              top: m.top,
              animation: `cruzar ${m.duracion} linear ${m.retraso} infinite`,
            }}
          />
        ))}

        {FANTASMAS.map((f) => (
          <Fantasma
            key={f.clase}
            className={`absolute text-cream/70 ${f.clase}`}
            style={{ animation: `aparecer ${f.duracion} ease-in-out ${f.retraso} infinite` }}
          />
        ))}
      </div>
    </>
  );
}
