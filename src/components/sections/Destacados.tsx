import Link from "next/link";
import Reveal from "@/components/Reveal";
import ProductCard from "@/components/ProductCard";
import BobaField from "@/components/BobaField";
import type { MenuExtra, MenuProduct } from "@/lib/types";

export default function Destacados({
  products,
  extras,
  currency,
}: {
  products: MenuProduct[];
  extras: MenuExtra[];
  currency: string;
}) {
  if (products.length === 0) return null;

  return (
    <section className="grain relative overflow-hidden bg-roa-900 py-24">
      <BobaField count={12} />

      <div className="relative mx-auto max-w-7xl px-5">
        <Reveal className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-hand text-3xl text-roa-300">los más pedidos</p>
            <h2 className="mt-1 font-display text-[clamp(2.6rem,7vw,5rem)] leading-[0.88] text-cream">
              Favoritos de
              <br />
              la barra
            </h2>
          </div>
          <Link
            href="/carta"
            className="rounded-full border-2 border-cream px-7 py-3.5 font-display text-lg text-cream transition hover:bg-cream hover:text-roa-900"
          >
            Ver las 40+ bebidas
          </Link>
        </Reveal>

        {/* En móvil van en carrusel: cuatro tarjetas apiladas obligan a
            scrollear demasiado antes de llegar a la carta. Se mueve con el
            dedo, no solo: en una cinta automática la tarjeta se va justo
            cuando el cliente iba a tocar Agregar. */}
        <div className="no-scrollbar overscroll-x-contain -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-5 px-5 pb-5 sm:hidden">
          {products.map((product) => (
            <div key={product.id} className="flex w-[78vw] max-w-[18rem] shrink-0 snap-start">
              <ProductCard
                product={product}
                extras={extras}
                currency={currency}
                index={0}
              />
            </div>
          ))}
        </div>

        <div className="hidden gap-5 sm:grid sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product, i) => (
            <Reveal key={product.id} delay={i * 70}>
              <ProductCard
                product={product}
                extras={extras}
                currency={currency}
                index={i}
              />
            </Reveal>
          ))}
        </div>

        {/* Puerta de entrada al programa de fidelidad */}
        <Reveal delay={200}>
          <Link
            href="/fidelidad"
            className="group mx-auto mt-14 flex w-full max-w-2xl flex-col items-center gap-4 rounded-[2.5rem] border-2 border-ink bg-mango px-7 py-7 text-center text-ink shadow-[6px_6px_0_var(--color-ink)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[11px_13px_0_var(--color-ink)] sm:flex-row sm:text-left"
          >
            <span className="flex-1">
              <span className="block font-hand text-2xl leading-none text-ink/60">
                junta sellos, toma gratis
              </span>
              <span className="mt-1 block font-display text-[clamp(1.9rem,5vw,2.7rem)] leading-none">
                Roa Brew Points
              </span>
            </span>

            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 border-ink text-2xl transition-transform duration-300 group-hover:translate-x-1.5">
              →
            </span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
