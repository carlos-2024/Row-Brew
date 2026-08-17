"use client";

import { useEffect, useRef, useState } from "react";
import { KodaMark } from "@/components/Logo";

/**
 * Logo de Koda (el perrito con lentes y el vaso).
 *
 * Usa el archivo real en /img/koda.png si existe; si no está, cae al trazo
 * vectorial para que nunca se vea una imagen rota.
 * Reemplaza el archivo y listo, no hay que tocar código.
 */
export function KodaLogo({
  className = "",
  /** Usa la versión blanca del logo, para fondos oscuros */
  white = false,
}: {
  className?: string;
  white?: boolean;
}) {
  // Ambos PNG tienen transparencia; el .jpg queda como último recurso por si
  // alguien repone el archivo antiguo. Si no hay ninguno, se dibuja el vector.
  const CANDIDATES = white
    ? ["/img/kodaWhite.png"]
    : ["/img/koda.png", "/img/koda.jpg"];
  const [attempt, setAttempt] = useState(0);
  const ref = useRef<HTMLImageElement>(null);

  // La imagen del HTML del servidor puede fallar ANTES de que React hidrate,
  // y en ese caso el onError nunca llega. Por eso al montar se revisa el
  // estado real del elemento.
  useEffect(() => {
    const img = ref.current;
    if (img?.complete && img.naturalWidth === 0) setAttempt((a) => a + 1);
  }, []);

  if (attempt >= CANDIDATES.length) return <KodaMark className={className} />;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      key={CANDIDATES[attempt]}
      src={CANDIDATES[attempt]}
      alt="Koda, la mascota de Roa Brew"
      onError={() => setAttempt((a) => a + 1)}
      className={`${className} object-contain`}
    />
  );
}

/**
 * Badge vertical verde del logo: bordes superiores rectos, inferiores
 * redondeados y "ROA BREW" girado 90°. Es el sello que aparece en la
 * esquina de todos los posters.
 */
export function BrandBadge({
  className = "",
  height = "13rem",
  /** "top" cuelga del borde superior; "bottom" se apoya en el inferior */
  anchor = "top",
}: {
  className?: string;
  height?: string;
  anchor?: "top" | "bottom";
}) {
  return (
    <div
      aria-hidden
      className={`flex w-[3.6rem] items-center justify-center bg-roa-500 ${
        anchor === "top" ? "rounded-b-[1.8rem]" : "rounded-t-[1.8rem]"
      } ${className}`}
      style={{ height }}
    >
      <span className="flex rotate-90 flex-col items-center leading-none text-cream">
        <span className="font-display text-[1.9rem] tracking-tight">ROA</span>
        <span className="font-body text-[0.55rem] font-black tracking-[0.38em] pl-[0.3em]">
          BREW
        </span>
      </span>
    </div>
  );
}
