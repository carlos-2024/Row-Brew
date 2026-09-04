"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import type { CartExtra, MenuExtra, MenuExtraGroup, MenuProduct } from "@/lib/types";

/**
 * Elegir opcionales y agregar al carrito, en la página del producto.
 *
 * La tarjeta de la carta hace lo mismo en pequeño, pero ahí los opcionales
 * están plegados tras un "+" porque compiten con otras cuarenta tarjetas. Acá
 * hay una sola bebida en pantalla, así que van abiertos: es la decisión que el
 * cliente vino a tomar.
 */
export default function AddToCart({
  product,
  extras,
  currency,
}: {
  product: MenuProduct;
  extras: MenuExtra[];
  currency: string;
}) {
  const { add, setOpen } = useCart();
  const [selected, setSelected] = useState<CartExtra[]>([]);
  const [cantidad, setCantidad] = useState(1);

  const grupos = product.extraGroups ?? [];
  const extrasTotal = selected.reduce((s, e) => s + e.price, 0);
  const total = (product.price + extrasTotal) * cantidad;

  /** Misma regla que en la carta: con tope, lo nuevo reemplaza a lo más viejo. */
  function toggle(extra: MenuExtra, grupo?: MenuExtraGroup) {
    setSelected((prev) => {
      if (prev.some((e) => e.name === extra.name)) {
        return prev.filter((e) => e.name !== extra.name);
      }

      const elegido = { name: extra.name, price: extra.price };
      if (!grupo || grupo.maxChoices < 1) return [...prev, elegido];

      const delGrupo = new Set(grupo.extras.map((e) => e.name));
      const propias = prev.filter((e) => delGrupo.has(e.name));
      if (propias.length < grupo.maxChoices) return [...prev, elegido];

      const sale = propias[0].name;
      return [...prev.filter((e) => e.name !== sale), elegido];
    });
  }

  function agregar() {
    add(product, selected, cantidad);
    setSelected([]);
    setCantidad(1);
    setOpen(true);
  }

  const Opcion = ({
    extra,
    grupo,
  }: {
    extra: MenuExtra;
    grupo?: MenuExtraGroup;
  }) => {
    const on = selected.some((e) => e.name === extra.name);
    return (
      <button
        type="button"
        onClick={() => toggle(extra, grupo)}
        aria-pressed={on}
        className={`rounded-full border-2 px-4 py-2 text-sm font-bold transition ${
          on
            ? "border-cream bg-roa-500 text-cream"
            : "border-cream/20 bg-cream/5 text-cream/75 hover:border-cream/50"
        }`}
      >
        {extra.name}
        {extra.price > 0 && ` +${extra.price}`}
      </button>
    );
  };

  return (
    <div>
      {grupos.map((grupo) => {
        const elegidas = selected.filter((s) =>
          grupo.extras.some((e) => e.name === s.name)
        ).length;

        return (
          <div key={grupo.id} className="mb-5">
            <p className="mb-2 flex flex-wrap items-baseline gap-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-roa-300">
                {grupo.name}
              </span>
              {grupo.hint && (
                <span className="font-hand text-lg leading-none text-cream/45">
                  {grupo.hint}
                </span>
              )}
              {grupo.maxChoices > 0 && (
                <span className="text-[11px] text-cream/35">
                  {elegidas}/{grupo.maxChoices}
                </span>
              )}
            </p>
            <div className="flex flex-wrap gap-2">
              {grupo.extras.map((e) => (
                <Opcion key={e.id} extra={e} grupo={grupo} />
              ))}
            </div>
          </div>
        );
      })}

      {extras.length > 0 && (
        <div className="mb-5">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-roa-300">
            Extras
          </p>
          <div className="flex flex-wrap gap-2">
            {extras.map((e) => (
              <Opcion key={e.id} extra={e} />
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-full border-2 border-cream/25 px-2 py-1">
          <button
            type="button"
            onClick={() => setCantidad((n) => Math.max(1, n - 1))}
            aria-label="Quitar uno"
            className="grid h-9 w-9 place-items-center rounded-full text-xl text-cream transition hover:bg-cream/10"
          >
            −
          </button>
          <span className="w-8 text-center font-display text-xl text-cream">
            {cantidad}
          </span>
          <button
            type="button"
            onClick={() => setCantidad((n) => Math.min(50, n + 1))}
            aria-label="Agregar uno"
            className="grid h-9 w-9 place-items-center rounded-full text-xl text-cream transition hover:bg-cream/10"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={agregar}
          className="btn-shine flex-1 rounded-full border-2 border-ink bg-mango px-8 py-4 font-display text-xl text-ink shadow-[5px_5px_0_var(--color-ink)] transition hover:-translate-y-0.5"
        >
          Agregar · {currency} {total.toFixed(2)}
        </button>
      </div>
    </div>
  );
}
