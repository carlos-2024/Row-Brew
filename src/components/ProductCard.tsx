"use client";

import { useState } from "react";
import CupArt from "@/components/CupArt";
import { useCart } from "@/components/cart/CartProvider";
import type { CartExtra, MenuExtra, MenuProduct } from "@/lib/types";

type Props = {
  product: MenuProduct;
  extras: MenuExtra[];
  currency: string;
  /** Retraso de la animación de entrada */
  index?: number;
};

const BADGES: Record<string, { text: string; className: string }> = {
  nuevo: { text: "NUEVO", className: "bg-mango text-ink -rotate-6" },
  estrella: { text: "★ TOP", className: "bg-grape text-ink rotate-6" },
};

export default function ProductCard({ product, extras, currency, index = 0 }: Props) {
  const { add, lastAdded } = useCart();
  const [picking, setPicking] = useState(false);
  const [selected, setSelected] = useState<CartExtra[]>([]);

  const justAdded = lastAdded === product.id;
  const extrasTotal = selected.reduce((s, e) => s + e.price, 0);
  const badge = product.badge ? BADGES[product.badge] : null;

  function toggleExtra(extra: MenuExtra) {
    setSelected((prev) =>
      prev.some((e) => e.name === extra.name)
        ? prev.filter((e) => e.name !== extra.name)
        : [...prev, { name: extra.name, price: extra.price }]
    );
  }

  function handleAdd() {
    add(product, selected);
    setSelected([]);
    setPicking(false);
  }

  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-3xl border-2 border-ink bg-cream text-ink shadow-[5px_5px_0_var(--color-ink)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[9px_11px_0_var(--color-ink)]"
      style={{ animationDelay: `${index * 45}ms` }}
    >
      {badge && (
        <span
          className={`absolute right-3 top-3 z-10 rounded-full border-2 border-ink px-3 py-1 text-xs font-black tracking-wide ${badge.className}`}
        >
          {badge.text}
        </span>
      )}

      {/* Ilustración / foto */}
      <div className="relative grid h-44 place-items-center overflow-hidden bg-gradient-to-b from-roa-200 to-roa-100">
        <div className="glow absolute inset-x-6 top-4 h-24 opacity-45" />
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="relative h-40 w-full object-contain transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <CupArt
            name={product.name}
            categorySlug={product.categorySlug}
            className="relative h-36 transition-transform duration-500 group-hover:-translate-y-1.5 group-hover:scale-105"
          />
        )}
        {product.size && (
          <span className="absolute bottom-2 left-3 rounded-full bg-ink/85 px-2.5 py-1 text-[11px] font-bold text-cream">
            {product.size}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-[1.35rem] leading-tight">{product.name}</h3>
        {product.description && (
          <p className="mt-1.5 flex-1 text-sm leading-snug text-ink/60">
            {product.description}
          </p>
        )}

        {/* Extras */}
        {picking && extras.length > 0 && (
          <div className="mt-3 rounded-2xl border-2 border-ink/12 bg-white/60 p-3">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-roa-600">
              Extras
            </p>
            <div className="flex flex-wrap gap-1.5">
              {extras.map((extra) => {
                const on = selected.some((e) => e.name === extra.name);
                return (
                  <button
                    key={extra.id}
                    onClick={() => toggleExtra(extra)}
                    className={`rounded-full border-2 px-3 py-1.5 text-xs font-bold transition ${
                      on
                        ? "border-ink bg-roa-500 text-cream"
                        : "border-ink/15 bg-cream hover:border-ink/45"
                    }`}
                  >
                    {extra.name} +{extra.price}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-4 flex items-end justify-between gap-3">
          <div className="leading-none">
            <span className="font-display text-3xl text-roa-700">
              {currency} {(product.price + extrasTotal).toFixed(0)}
            </span>
            {extrasTotal > 0 && (
              <span className="ml-1 text-xs font-bold text-grape-deep">
                (+{extrasTotal})
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {extras.length > 0 && (
              <button
                onClick={() => setPicking((v) => !v)}
                aria-label="Elegir extras"
                aria-pressed={picking}
                className={`grid h-10 w-10 place-items-center rounded-full border-2 border-ink text-lg transition ${
                  picking ? "rotate-45 bg-ink text-cream" : "bg-cream hover:bg-roa-200"
                }`}
              >
                +
              </button>
            )}
            <button
              onClick={handleAdd}
              className={`rounded-full border-2 border-ink px-5 py-2.5 font-bold transition active:scale-95 ${
                justAdded
                  ? "bg-mango text-ink"
                  : "bg-ink text-cream hover:bg-roa-600"
              }`}
            >
              {justAdded ? "¡Listo! ✓" : "Agregar"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
