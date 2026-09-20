"use client";

import { useState } from "react";
import { ScooterIcon } from "@/components/Icons";

export type Direccion = {
  label: string;
  /** Siempre null: la dirección se escribe, no se ubica en el mapa */
  lat: number | null;
  lng: number | null;
  precise: boolean;
  zone: "gratis" | "costo" | "fuera" | "desconocida";
  fee: number;
  message: string | null;
};

const MENSAJE =
  "Te confirmamos por WhatsApp si llegamos a tu zona y cuánto cuesta el envío.";

/** Debajo de esto no es una dirección, es una palabra suelta. */
const MINIMO = 8;

const INPUT =
  "w-full resize-none rounded-xl border-2 border-ink/15 bg-white/70 px-4 py-3 text-ink outline-none transition placeholder:text-ink/30 focus:border-roa-500";

/**
 * Dirección de entrega, escrita a mano.
 *
 * Antes esto era un buscador predictivo que ubicaba el portal en el mapa y de
 * ahí sacaba la zona y el costo del envío. Se quitó: ningún buscador tiene
 * todas las direcciones de Lima —una casa nueva, un pasaje sin nombre, una
 * numeración que no figura—, y quien no aparecía en la lista se quedaba sin
 * poder pedir. Escribir libre no falla nunca.
 *
 * A cambio, el envío deja de calcularse solo y se acuerda por WhatsApp. El
 * pedido viaja sin coordenadas, que es el mismo caso que ya manejaba el
 * servidor cuando la dirección se escribía a mano.
 */
export default function AddressSearch({
  value,
  onChange,
}: {
  value: Direccion | null;
  onChange: (d: Direccion | null) => void;
  /** Se mantiene por compatibilidad con el carrito; ya no se muestra costo */
  currency?: string;
}) {
  const [texto, setTexto] = useState(value?.label ?? "");

  function escribir(v: string) {
    setTexto(v);
    const limpio = v.trim();
    onChange(
      limpio.length >= MINIMO
        ? {
            label: limpio,
            lat: null,
            lng: null,
            precise: false,
            zone: "desconocida",
            fee: 0,
            message: MENSAJE,
          }
        : null,
    );
  }

  return (
    <div>
      <textarea
        value={texto}
        onChange={(e) => escribir(e.target.value)}
        rows={2}
        placeholder="Ej: Jr. Manuel Rivero 389, Los Olivos"
        className={INPUT}
        autoComplete="street-address"
      />
      <p className="mt-2 text-xs leading-snug text-ink/50">
        Escribe calle, número, referencia y distrito.
      </p>

      {value && (
        <div className="mt-3 rounded-2xl border-2 border-ink/25 bg-white/70 p-4 text-ink animate-[pop-in_0.4s_cubic-bezier(0.34,1.56,0.64,1)]">
          <p className="flex items-center gap-2 font-display text-lg leading-none">
            <ScooterIcon className="h-5 w-5" />
            Envío por confirmar
          </p>
          <p className="mt-1.5 text-xs leading-snug opacity-75">{MENSAJE}</p>
        </div>
      )}
    </div>
  );
}
