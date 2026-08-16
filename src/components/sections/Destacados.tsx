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

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
      </div>
    </section>
  );
}
