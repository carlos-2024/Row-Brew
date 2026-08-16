"use client";

import { useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { CategoryIcon, SearchIcon } from "@/components/Icons";
import type { MenuCategory, MenuExtra } from "@/lib/types";

type Props = {
  categories: MenuCategory[];
  extras: MenuExtra[];
  currency: string;
};

const THEME_PILL: Record<string, string> = {
  green: "bg-roa-500 text-cream",
  cream: "bg-cream-2 text-ink",
  black: "bg-ink text-cream",
  purple: "bg-grape text-ink",
};

export default function MenuExplorer({ categories, extras, currency }: Props) {
  const [active, setActive] = useState<string>("todo");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return categories
      .filter((c) => active === "todo" || c.slug === active)
      .map((c) => ({
        ...c,
        products: q
          ? c.products.filter(
              (p) =>
                p.name.toLowerCase().includes(q) ||
                (p.description ?? "").toLowerCase().includes(q)
            )
          : c.products,
      }))
      .filter((c) => c.products.length > 0);
  }, [categories, active, query]);

  const total = visible.reduce((s, c) => s + c.products.length, 0);

  return (
    <div>
      {/* Barra de filtros pegajosa */}
      <div className="sticky top-[4.5rem] z-20 -mx-5 mb-10 border-y-2 border-cream/10 bg-roa-950/92 px-5 py-3 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            <button
              onClick={() => setActive("todo")}
              className={`shrink-0 rounded-full border-2 border-ink px-5 py-2.5 font-bold transition ${
                active === "todo"
                  ? "bg-mango text-ink"
                  : "border-cream/20 text-cream/70 hover:border-cream hover:text-cream"
              }`}
            >
              Todo
            </button>
            {categories.map((c) => (
              <button
                key={c.slug}
                onClick={() => setActive(c.slug)}
                className={`flex shrink-0 items-center gap-2 rounded-full border-2 px-5 py-2.5 font-bold transition ${
                  active === c.slug
                    ? `border-ink ${THEME_PILL[c.theme] ?? THEME_PILL.green}`
                    : "border-cream/20 text-cream/70 hover:border-cream hover:text-cream"
                }`}
              >
                <CategoryIcon slug={c.slug} className="h-5 w-5" />
                {c.name}
              </button>
            ))}
          </div>

          <div className="relative shrink-0 lg:w-72">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Busca mango, matcha, taro…"
              aria-label="Buscar en la carta"
              className="w-full rounded-full border-2 border-cream/20 bg-roa-900 py-2.5 pl-11 pr-4 text-cream outline-none transition placeholder:text-cream/35 focus:border-roa-400"
            />
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-cream/45" />
          </div>
        </div>
      </div>

      {total === 0 ? (
        <div className="py-24 text-center">
          <p className="font-display text-4xl text-cream">Nada por acá</p>
          <p className="mt-2 text-cream/55">
            No encontramos “{query}”. Prueba con mango, fresa, matcha o taro.
          </p>
          <button
            onClick={() => {
              setQuery("");
              setActive("todo");
            }}
            className="mt-6 rounded-full border-2 border-cream px-6 py-3 font-bold text-cream transition hover:bg-cream hover:text-ink"
          >
            Ver toda la carta
          </button>
        </div>
      ) : (
        <div className="space-y-20">
          {visible.map((category) => (
            <section key={category.slug} id={category.slug} className="scroll-mt-40">
              <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="font-hand text-2xl text-roa-300">{category.tagline}</p>
                  <h2 className="font-display text-[clamp(2.4rem,6vw,4rem)] text-cream">
                    {category.name}
                  </h2>
                </div>
                <span className="rounded-full border-2 border-cream/20 px-4 py-1.5 text-sm font-bold text-cream/60">
                  {category.products.length} bebidas
                </span>
              </header>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {category.products.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    extras={extras}
                    currency={currency}
                    index={i}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
