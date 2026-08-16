"use client";

import { useMemo } from "react";

type Props = {
  /** Cantidad de burbujas */
  count?: number;
  className?: string;
  /** Colores de las bobas */
  colors?: string[];
};

/**
 * Campo de "popping boba" que sube flotando por el fondo.
 * Es el motivo visual que hila toda la marca.
 */
export default function BobaField({
  count = 18,
  className = "",
  colors = ["#a98bf0", "#f2a341", "#d94a5f", "#93b47f", "#c9a7e8"],
}: Props) {
  const bubbles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        // Pseudo-aleatorio determinista para que no salte en la hidratación
        const r = (n: number) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
        // Todos los valores se serializan como string ya redondeado: si se pasan
        // como número, React los formatea distinto en servidor y cliente y salta
        // un error de hidratación.
        return {
          left: `${(r(1) * 100).toFixed(2)}%`,
          size: `${(8 + r(2) * 26).toFixed(2)}px`,
          delay: (r(3) * 9).toFixed(2),
          duration: (7 + r(4) * 8).toFixed(2),
          color: colors[Math.floor(r(5) * colors.length)],
          opacity: (0.28 + r(6) * 0.42).toFixed(3),
        };
      }),
    [count, colors]
  );

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {bubbles.map((b, i) => (
        <span
          key={i}
          className="absolute bottom-[-60px] rounded-full"
          style={{
            left: b.left,
            width: b.size,
            height: b.size,
            background: `radial-gradient(circle at 32% 30%, #ffffffcc 0%, ${b.color} 42%, ${b.color} 100%)`,
            opacity: b.opacity,
            animation: `rise ${b.duration}s linear ${b.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
