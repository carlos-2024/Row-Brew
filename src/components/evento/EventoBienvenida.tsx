"use client";

import { useEffect, useState } from "react";

/**
 * Pantalla de bienvenida del evento: el título, la barra y la bajada, unos
 * segundos, y después se va para dejar la carta.
 *
 * La salida la hace el CSS, no este componente. Así el tiempo se cumple
 * aunque la página tarde en hidratarse —en una feria la señal es mala— y si
 * el JavaScript nunca llega, la portada se quita igual en vez de quedarse
 * tapando la carta para siempre.
 *
 * Lo único que agrega el JavaScript son dos comodidades: tocar para saltarla,
 * y desmontarla del todo al terminar para que no quede un elemento invisible
 * encima de la carta.
 */
export default function EventoBienvenida({
  titulo,
  kicker,
  segundos,
}: {
  titulo: string;
  kicker: string;
  /** Cuánto se queda antes de empezar a irse. 0 la desactiva. */
  segundos: number;
}) {
  const [fuera, setFuera] = useState(false);

  // Mientras se ve, no se puede desplazar: la carta está detrás y ver medio
  // título flotando sobre ella se lee como un error
  useEffect(() => {
    if (fuera) return;
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = antes;
    };
  }, [fuera]);

  /**
   * Red de seguridad: si la animación no dispara su evento —pestaña en
   * segundo plano, o "reducir movimiento" en el sistema— el temporizador la
   * quita igual.
   */
  useEffect(() => {
    const t = window.setTimeout(() => setFuera(true), segundos * 1000 + 1500);
    return () => window.clearTimeout(t);
  }, [segundos]);

  if (fuera) return null;

  return (
    <div
      onClick={() => setFuera(true)}
      onAnimationEnd={() => setFuera(true)}
      // Decorativa: el mismo título y la misma bajada están en la página de
      // abajo, así que repetirlos a un lector de pantalla solo estorba
      aria-hidden
      style={{ animation: `salida-bienvenida 0.7s ease ${segundos}s forwards` }}
      className="fixed inset-0 z-[200] grid cursor-pointer place-items-center overflow-hidden bg-roa-500 px-5 text-center"
    >
      <div className="grain pointer-events-none absolute inset-0" />

      <div className="relative mx-auto max-w-3xl">
        <h2 className="font-display text-[clamp(2.4rem,8vw,4.5rem)] leading-[0.95] text-cream">
          {titulo}
        </h2>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/img/barra-evento.webp"
          alt=""
          className="mx-auto mt-6 w-full max-w-xl animate-float-slow"
          fetchPriority="high"
        />

        <p className="mt-5 font-hand text-[clamp(1.8rem,5vw,2.8rem)] leading-none text-grape">
          {kicker}
        </p>
      </div>

      <p className="absolute bottom-7 left-0 right-0 text-xs text-cream/40">
        Toca para continuar
      </p>
    </div>
  );
}
