"use client";

import { useEffect, useState } from "react";

type Restante = { dias: number; horas: number; min: number; seg: number };

function calcular(target: number): Restante | null {
  const diff = target - Date.now();
  if (diff <= 0) return null;

  return {
    dias: Math.floor(diff / 86_400_000),
    horas: Math.floor((diff / 3_600_000) % 24),
    min: Math.floor((diff / 60_000) % 60),
    seg: Math.floor((diff / 1000) % 60),
  };
}

/**
 * Cuenta regresiva al lanzamiento.
 *
 * El cálculo se hace solo en el navegador: si se renderizara en el servidor,
 * el HTML llegaría con un segundo distinto al del cliente y React marcaría un
 * error de hidratación. Hasta que monta se muestran guiones.
 */
export default function CountdownTimer({ target }: { target: string }) {
  const [restante, setRestante] = useState<Restante | null>(null);
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    const ms = new Date(target).getTime();
    if (Number.isNaN(ms)) return;

    setMontado(true);
    setRestante(calcular(ms));

    const id = setInterval(() => setRestante(calcular(ms)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (montado && restante === null) {
    return (
      <p className="font-display text-[clamp(2rem,6vw,3.5rem)] text-mango">
        ¡Ya estamos en línea!
      </p>
    );
  }

  const bloques: [string, number | null][] = [
    ["días", restante?.dias ?? null],
    ["horas", restante?.horas ?? null],
    ["min", restante?.min ?? null],
    ["seg", restante?.seg ?? null],
  ];

  return (
    <div
      // Rejilla fija de 4: con flex-wrap en móvil se partía 3+1
      className="mx-auto grid w-full max-w-md grid-cols-4 gap-2 sm:max-w-xl sm:gap-4"
      role="timer"
      aria-live="off"
      aria-label="Tiempo restante para el lanzamiento"
    >
      {bloques.map(([label, valor], i) => (
        <div
          key={label}
          className="rounded-2xl border-2 border-ink bg-cream px-1 py-3 text-center shadow-[4px_4px_0_var(--color-ink)] sm:px-5 sm:py-4 sm:shadow-[5px_5px_0_var(--color-ink)]"
          style={{
            animation: `pop-in 0.5s cubic-bezier(0.34,1.56,0.64,1) ${i * 90}ms both`,
          }}
        >
          <span
            // La clave hace que React reemplace el nodo en cada cambio, y con
            // eso la animación del sello se vuelve a disparar cada segundo.
            key={valor ?? "vacio"}
            className="block font-display text-[clamp(1.9rem,7vw,3.2rem)] leading-none text-roa-700 tabular-nums"
            style={
              label === "seg"
                ? { animation: "pop-in 0.35s cubic-bezier(0.34,1.56,0.64,1) both" }
                : undefined
            }
          >
            {valor === null ? "--" : String(valor).padStart(2, "0")}
          </span>
          <span className="mt-1 block text-[0.65rem] font-black uppercase tracking-[0.2em] text-ink/45 sm:text-xs">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
