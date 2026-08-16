/**
 * Ilustración generativa de cada bebida.
 *
 * Mientras no haya foto cargada, cada producto se dibuja como un vaso
 * con las capas de color que le corresponden según su nombre y categoría.
 * Así la carta se ve completa desde el día uno y ninguna tarjeta queda vacía.
 */

type Palette = {
  top: string;
  bottom: string;
  foam: boolean;
  boba: "popping" | "tapioca" | null;
  fizz: boolean;
  ice: boolean;
};

const C = {
  matcha: "#7EA23F",
  matchaDeep: "#5C7C2B",
  milk: "#F6EFDD",
  coffee: "#4A2C1B",
  coffeeLight: "#8A5A38",
  mango: "#F5A63C",
  passion: "#F2C63C",
  strawberry: "#E8546B",
  pink: "#F58BA0",
  berry: "#B5305C",
  blueberry: "#6E5AA8",
  taro: "#B694E8",
  ube: "#8A5FD6",
  lemon: "#D9E05C",
  peach: "#F2A37E",
  pistachio: "#C3D08A",
  caramel: "#C98A3C",
  tea: "#C08A4A",
  pineapple: "#F2D06B",
} as const;

function has(name: string, ...words: string[]): boolean {
  const n = name.toLowerCase();
  return words.some((w) => n.includes(w));
}

/** Color de fruta dominante en el nombre de la bebida. */
function fruitColor(name: string): string | null {
  if (has(name, "maracu", "passion", "hawaii")) return C.passion;
  if (has(name, "mango")) return C.mango;
  if (has(name, "fresa", "fresita", "strawberry")) return C.strawberry;
  if (has(name, "berry", "berrys", "frutos rojos", "dragon")) return C.berry;
  if (has(name, "arándano", "arandano", "blueberry")) return C.blueberry;
  if (has(name, "taro")) return C.taro;
  if (has(name, "ube")) return C.ube;
  if (has(name, "pistacho")) return C.pistachio;
  if (has(name, "limon", "lemon", "limonada")) return C.lemon;
  if (has(name, "naranja", "orange", "mont blanc", "mandarina")) return C.mango;
  if (has(name, "durazno", "peach")) return C.peach;
  if (has(name, "piña", "golden")) return C.pineapple;
  if (has(name, "caramel")) return C.caramel;
  if (has(name, "pink")) return C.pink;
  return null;
}

export function drinkPalette(name: string, categorySlug: string): Palette {
  const fruit = fruitColor(name);
  const foam = has(name, "foam", "cloud", "latte", "espumada", "mont blanc", "milk");

  switch (categorySlug) {
    case "matcha":
      return {
        top: C.matcha,
        bottom: fruit ?? C.milk,
        foam: foam || has(name, "matcha"),
        boba: has(name, "boba", "pop") ? "popping" : null,
        fizz: has(name, "sparkling", "lemonade"),
        ice: true,
      };

    case "cold-brew":
      return {
        top: has(name, "foam", "latte", "leche", "milk", "mont blanc", "golden")
          ? C.coffeeLight
          : C.coffee,
        bottom: fruit ?? C.coffee,
        foam,
        boba: null,
        fizz: has(name, "gasificada", "ginger", "sparkling", "limonada", "pink", "arándano", "arandano"),
        ice: true,
      };

    case "milk-tea":
      return {
        top: fruit ?? C.tea,
        bottom: fruit ? C.milk : C.tea,
        foam: true,
        boba: "tapioca",
        fizz: false,
        ice: false,
      };

    default: // sparkling-tea y cualquier categoría nueva
      return {
        top: fruit ?? C.mango,
        bottom: fruit === C.strawberry ? C.berry : (fruit ?? C.passion),
        foam: false,
        boba: "popping",
        fizz: true,
        ice: true,
      };
  }
}

type Props = {
  name: string;
  categorySlug: string;
  className?: string;
  /** Anima el líquido y las burbujas */
  animated?: boolean;
};

export default function CupArt({
  name,
  categorySlug,
  className = "",
  animated = true,
}: Props) {
  const p = drinkPalette(name, categorySlug);
  const uid = `${categorySlug}-${name.replace(/\W+/g, "")}`;

  return (
    <svg
      viewBox="0 0 120 168"
      className={className}
      role="img"
      aria-label={`Ilustración de ${name}`}
    >
      <defs>
        <clipPath id={`cup-${uid}`}>
          <path d="M24 36h72l-7 104a12 12 0 0 1-12 11H43a12 12 0 0 1-12-11L24 36Z" />
        </clipPath>
        <linearGradient id={`liq-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.top} />
          <stop offset="52%" stopColor={p.top} />
          <stop offset="60%" stopColor={p.bottom} />
          <stop offset="100%" stopColor={p.bottom} />
        </linearGradient>
        <linearGradient id={`glass-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.34" />
          <stop offset="26%" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="78%" stopColor="#ffffff" stopOpacity="0.02" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.22" />
        </linearGradient>
      </defs>

      {/* Sorbete */}
      <rect
        x="70"
        y="4"
        width="9"
        height="42"
        rx="4.5"
        fill="#0c100b"
        transform="rotate(11 74 25)"
      />

      {/* Contenido del vaso */}
      <g clipPath={`url(#cup-${uid})`}>
        <rect x="20" y="30" width="80" height="130" fill={`url(#liq-${uid})`} />

        {/* Cold foam / leche espumada */}
        {p.foam && (
          <>
            <rect x="20" y="36" width="80" height="26" fill={C.milk} opacity="0.94" />
            <ellipse cx="60" cy="62" rx="42" ry="7" fill={C.milk} opacity="0.94" />
          </>
        )}

        {/* Onda entre capas */}
        <path
          d="M20 96c12-8 22 6 34 1s22-11 34-3 12 6 12 6v12H20V96Z"
          fill={p.bottom}
          opacity="0.92"
          className={animated ? "liquid" : undefined}
        />

        {/* Hielo */}
        {p.ice && (
          <g fill="#ffffff" opacity="0.3">
            <rect x="33" y="48" width="19" height="16" rx="4" transform="rotate(-14 42 56)" />
            <rect x="62" y="58" width="17" height="15" rx="4" transform="rotate(17 70 65)" />
            <rect x="41" y="72" width="16" height="14" rx="4" transform="rotate(8 49 79)" />
          </g>
        )}

        {/* Burbujas del sparkling */}
        {p.fizz && (
          <g fill="#ffffff" opacity="0.55">
            <circle cx="38" cy="112" r="2.6" />
            <circle cx="52" cy="126" r="2" />
            <circle cx="72" cy="106" r="2.3" />
            <circle cx="82" cy="124" r="1.8" />
            <circle cx="60" cy="140" r="2.2" />
            <circle cx="44" cy="134" r="1.6" />
          </g>
        )}

        {/* Bobas */}
        {p.boba === "tapioca" && (
          <g fill="#1a1108">
            <circle cx="42" cy="140" r="7" />
            <circle cx="58" cy="146" r="7" />
            <circle cx="74" cy="139" r="7" />
            <circle cx="50" cy="130" r="6" />
            <circle cx="67" cy="128" r="6" />
          </g>
        )}
        {p.boba === "popping" && (
          <g>
            {[
              [42, 140, 6.5],
              [58, 147, 6],
              [74, 139, 6.5],
              [50, 130, 5.5],
              [67, 129, 5.5],
            ].map(([cx, cy, r], i) => (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={r}
                fill={p.bottom}
                stroke="#ffffff"
                strokeOpacity="0.65"
                strokeWidth="1.4"
              />
            ))}
          </g>
        )}

        {/* Brillo del vaso */}
        <rect x="20" y="30" width="80" height="130" fill={`url(#glass-${uid})`} />
      </g>

      {/* Contorno del vaso */}
      <path
        d="M24 36h72l-7 104a12 12 0 0 1-12 11H43a12 12 0 0 1-12-11L24 36Z"
        fill="none"
        stroke="#0c100b"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Tapa */}
      <rect x="18" y="26" width="84" height="13" rx="6.5" fill="#0c100b" />
      <rect x="22" y="29" width="76" height="4" rx="2" fill="#ffffff" opacity="0.18" />
    </svg>
  );
}
