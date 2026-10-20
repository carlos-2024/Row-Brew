"use client";

import { useEffect, useRef, useState } from "react";
import { TagIcon, CheckIcon } from "@/components/Icons";

export type DescuentoAplicado = { code: string; amount: number } | null;

type ItemParaValidar = { productId: string; quantity: number; extrasTotal: number };

const INPUT =
  "w-full rounded-xl border-2 border-ink/15 bg-white/70 px-4 py-3 pl-11 uppercase tracking-wide text-ink outline-none transition placeholder:normal-case placeholder:tracking-normal placeholder:text-ink/30 focus:border-roa-500";

/**
 * Código de descuento para productos de aliados.
 *
 * El campo solo aparece si el carrito lleva algo de un aliado: ofrecérselo a
 * quien pide solo bebidas de la casa es prometer algo que no se va a poder
 * cumplir, y además revela que existen cupones que no le sirven.
 *
 * El monto lo decide el servidor, siempre. Acá solo se muestra lo que él
 * responde y se guarda el texto del código; `/api/orders` lo vuelve a
 * calcular con la misma función antes de cobrar.
 */
export default function DiscountField({
  items,
  currency,
  hayDeAliados,
  value,
  onChange,
}: {
  items: ItemParaValidar[];
  currency: string;
  hayDeAliados: boolean;
  value: DescuentoAplicado;
  onChange: (d: DescuentoAplicado, texto: string) => void;
}) {
  const [texto, setTexto] = useState("");
  const [estado, setEstado] = useState<"quieto" | "validando">("quieto");
  const [error, setError] = useState<string | null>(null);
  const aborto = useRef<AbortController | null>(null);

  /**
   * Si el carrito cambia, el descuento ya calculado deja de valer: podría
   * haberse quitado justo el producto del aliado que lo habilitaba.
   */
  const firma = items
    .map((i) => `${i.productId}:${i.quantity}:${i.extrasTotal}`)
    .join("|");
  const firmaPrevia = useRef(firma);

  useEffect(() => {
    if (firma === firmaPrevia.current) return;
    firmaPrevia.current = firma;
    if (value) {
      onChange(null, texto);
      setError("Tu carrito cambió. Vuelve a aplicar el código.");
    }
  }, [firma, value, texto, onChange]);

  if (!hayDeAliados) return null;

  async function aplicar() {
    const limpio = texto.trim();
    if (!limpio) return;

    aborto.current?.abort();
    const ctrl = new AbortController();
    aborto.current = ctrl;

    setEstado("validando");
    setError(null);

    try {
      const res = await fetch("/api/descuento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: limpio, items }),
        signal: ctrl.signal,
      });
      const data = await res.json();

      if (data.ok) {
        onChange({ code: data.code, amount: data.amount }, limpio);
        setError(null);
      } else {
        onChange(null, limpio);
        setError(data.message || "Ese código no se puede aplicar.");
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setError("No pudimos validar el código. Intenta de nuevo.");
      }
    } finally {
      if (!ctrl.signal.aborted) setEstado("quieto");
    }
  }

  function quitar() {
    onChange(null, "");
    setTexto("");
    setError(null);
  }

  if (value) {
    return (
      <div className="rounded-2xl border-2 border-ink bg-mango p-4 text-ink">
        <p className="flex items-center gap-2 font-display text-lg leading-none">
          <CheckIcon className="h-5 w-5" />
          Código {value.code}
        </p>
        <p className="mt-1.5 text-sm font-bold">
          −{currency} {value.amount.toFixed(2)} en productos de aliados
        </p>
        <button
          type="button"
          onClick={quitar}
          className="mt-2 text-xs font-bold underline underline-offset-2"
        >
          Quitar código
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            value={texto}
            onChange={(e) => {
              setTexto(e.target.value);
              setError(null);
            }}
            // Enter dentro del carrito enviaría el pedido: acá solo aplica
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void aplicar();
              }
            }}
            placeholder="Código de descuento"
            className={INPUT}
            autoComplete="off"
            spellCheck={false}
          />
          <TagIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink/35" />
        </div>
        <button
          type="button"
          onClick={aplicar}
          disabled={estado === "validando" || !texto.trim()}
          className="shrink-0 rounded-xl border-2 border-ink px-5 font-display text-lg text-ink transition disabled:opacity-35"
        >
          {estado === "validando" ? "…" : "Aplicar"}
        </button>
      </div>

      {error && <p className="mt-2 text-xs leading-snug text-berry">{error}</p>}

      <p className="mt-2 text-xs leading-snug text-ink/45">
        Válido solo para productos de nuestras marcas aliadas.
      </p>
    </div>
  );
}
