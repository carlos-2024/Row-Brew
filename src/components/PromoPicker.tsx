"use client";

import { nombreProductos } from "@/lib/format";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import ProductArt from "@/components/ProductArt";
import { useCart } from "@/components/cart/CartProvider";
import { Sparkle } from "@/components/Leaf";
import type { PromoView } from "@/lib/types";

/**
 * Arma un combo de promoción.
 *
 * El cliente elige con qué bebidas quiere completarlo y se agregan sueltas al
 * carrito, junto con la promo elegida. El descuento no se calcula acá: lo
 * aplica `priceCart`, y el servidor lo recalcula al recibir el pedido.
 *
 * Armar el combo a propósito basta para que se cobre su precio, aunque la
 * promo no esté marcada como "cobra sola" en el panel: ese ajuste decide si
 * se aplica al juntar bebidas sueltas, que es otra cosa.
 */
export default function PromoPicker({
  promo,
  currency,
}: {
  promo: PromoView;
  currency: string;
}) {
  const { add, setOpen, chooseCombo } = useCart();
  const [abierto, setAbierto] = useState(false);
  const [montado, setMontado] = useState(false);
  const [elegidas, setElegidas] = useState<Record<string, number>>({});

  useEffect(() => setMontado(true), []);

  useEffect(() => {
    document.body.style.overflow = abierto ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [abierto]);

  const total = useMemo(
    () => Object.values(elegidas).reduce((s, n) => s + n, 0),
    [elegidas]
  );
  const faltan = promo.quantity - total;

  function cambiar(id: string, delta: number) {
    setElegidas((prev) => {
      const actual = prev[id] ?? 0;
      const nuevo = Math.max(0, actual + delta);
      // No se permite pasarse del tamaño del combo
      if (delta > 0 && total >= promo.quantity) return prev;
      const copia = { ...prev };
      if (nuevo === 0) delete copia[id];
      else copia[id] = nuevo;
      return copia;
    });
  }

  function agregar() {
    if (!promo.categorySlug) return;

    for (const [id, cantidad] of Object.entries(elegidas)) {
      const producto = promo.products.find((p) => p.id === id);
      if (producto) add(producto, [], cantidad);
    }

    chooseCombo({
      id: promo.id,
      title: promo.title,
      label: promo.label,
      categorySlug: promo.categorySlug,
      quantity: promo.quantity,
      price: promo.price,
    });
    setElegidas({});
    setAbierto(false);
    setOpen(true); // se abre el carrito para que vea el descuento aplicado
  }

  // Sin categoría no hay bebidas que ofrecer ni precio que aplicar
  if (!promo.categorySlug || promo.products.length === 0) return null;

  return (
    <>
      <button
        onClick={() => setAbierto(true)}
        className="mt-5 w-full rounded-full border-2 border-ink bg-cream px-5 py-3 font-bold text-ink transition hover:-translate-y-0.5 hover:bg-mango"
      >
        Armar mi {promo.label}
      </button>

      {abierto &&
        montado &&
        createPortal(
          <div
            onClick={() => setAbierto(false)}
            role="dialog"
            aria-modal="true"
            aria-label={`Armar ${promo.title} ${promo.label}`}
            className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-roa-950/85 p-4 backdrop-blur-sm sm:items-center"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="my-auto w-full max-w-2xl animate-[pop-in_0.4s_cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden rounded-[2rem] border-2 border-ink bg-cream text-ink shadow-[8px_8px_0_var(--color-ink)]"
            >
              <div className="flex items-start justify-between gap-4 border-b-2 border-ink/10 bg-roa-500 px-6 py-5 text-cream">
                <div>
                  <p className="font-hand text-2xl leading-none text-roa-100">
                    arma tu combo
                  </p>
                  <h3 className="mt-1 font-display text-3xl">
                    {promo.title} {promo.label}
                  </h3>
                  {promo.detail && (
                    <p className="mt-1 text-sm italic text-cream/70">{promo.detail}</p>
                  )}
                </div>
                <button
                  onClick={() => setAbierto(false)}
                  aria-label="Cerrar"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-cream text-xl transition hover:rotate-90 hover:bg-cream hover:text-roa-700"
                >
                  ✕
                </button>
              </div>

              <div className="px-6 py-5">
                <p className="mb-4 text-sm font-bold text-roa-700">
                  {faltan > 0
                    ? `Elige ${faltan} ${nombreProductos(promo.products.map((p) => p.categoryKind), faltan)} más`
                    : "¡Combo completo!"}
                  <span className="ml-2 font-normal text-ink/45">
                    {total} de {promo.quantity}
                  </span>
                </p>

                <div className="grid max-h-[45vh] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                  {promo.products.map((p) => {
                    const cantidad = elegidas[p.id] ?? 0;
                    const lleno = total >= promo.quantity && cantidad === 0;

                    return (
                      <div
                        key={p.id}
                        className={`flex items-center gap-3 rounded-2xl border-2 p-2.5 transition ${
                          cantidad > 0
                            ? "border-ink bg-roa-100"
                            : "border-ink/12 bg-white/60"
                        } ${lleno ? "opacity-40" : ""}`}
                      >
                        <div className="grid h-14 w-11 shrink-0 place-items-center rounded-xl bg-roa-200">
                          <ProductArt
                            name={p.name}
                            categorySlug={p.categorySlug}
                            kind={p.categoryKind}
                            className="h-12"
                            animated={false}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold leading-tight">
                            {p.name}
                          </p>
                          <p className="text-xs text-ink/45">
                            {currency} {p.price.toFixed(0)} suelto
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-1 rounded-full border-2 border-ink/15 bg-cream">
                          <button
                            onClick={() => cambiar(p.id, -1)}
                            disabled={cantidad === 0}
                            aria-label={`Quitar ${p.name}`}
                            className="grid h-7 w-7 place-items-center rounded-full text-lg transition hover:bg-ink hover:text-cream disabled:opacity-25"
                          >
                            −
                          </button>
                          <span className="w-5 text-center text-sm font-bold tabular-nums">
                            {cantidad}
                          </span>
                          <button
                            onClick={() => cambiar(p.id, 1)}
                            disabled={total >= promo.quantity}
                            aria-label={`Agregar ${p.name}`}
                            className="grid h-7 w-7 place-items-center rounded-full text-lg transition hover:bg-ink hover:text-cream disabled:opacity-25"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 flex items-center justify-between gap-4 border-t-2 border-ink/10 pt-4">
                  <div>
                    <p className="font-hand text-2xl text-roa-600">precio del combo</p>
                    <p className="font-display text-3xl leading-none">
                      {currency} {promo.price.toFixed(2)}
                    </p>
                  </div>

                  <button
                    onClick={agregar}
                    disabled={total !== promo.quantity}
                    className="btn-shine flex items-center gap-2 rounded-full border-2 border-ink bg-mango px-7 py-3.5 font-display text-xl text-ink shadow-[4px_4px_0_var(--color-ink)] transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-40"
                  >
                    <Sparkle className="h-5 w-5" />
                    Agregar al carrito
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
