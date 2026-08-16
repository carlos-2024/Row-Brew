import Link from "next/link";
import Reveal from "@/components/Reveal";
import Marquee from "@/components/Marquee";
import CupArt from "@/components/CupArt";
import { BrandBadge } from "@/components/Brand";
import { Sparkle } from "@/components/Leaf";
import type { PromoView } from "@/lib/types";

const THEME: Record<string, { card: string; label: string; art: string }> = {
  green: { card: "bg-roa-500 text-cream", label: "text-cream", art: "bg-roa-400" },
  cream: { card: "bg-cream text-ink", label: "text-ink", art: "bg-roa-200" },
  black: { card: "bg-ink text-cream", label: "text-cream", art: "bg-roa-800" },
  purple: { card: "bg-grape text-ink", label: "text-ink", art: "bg-taro" },
};

/** Bebida representativa para dibujar en cada promo. */
const SAMPLE: Record<string, string> = {
  "sparkling-tea": "Sparkling MaracuMango",
  matcha: "Mango Matcha Foam",
  "cold-brew": "Pink Cold Brew",
  "milk-tea": "Taro Tapioca",
};

export default function Promos({
  promos,
  currency,
}: {
  promos: PromoView[];
  currency: string;
}) {
  if (promos.length === 0) return null;

  return (
    <section
      id="promos"
      className="grain relative overflow-hidden bg-roa-950 py-24 text-cream"
    >
      <div className="glow pointer-events-none absolute left-1/2 top-0 h-96 w-[42rem] -translate-x-1/2 opacity-40" />

      {/* El sello verde de los posters, apoyado en el borde inferior */}
      <BrandBadge
        anchor="bottom"
        height="11rem"
        className="absolute bottom-0 right-6 hidden lg:flex"
      />

      {/* Cinta superior */}
      <div className="mb-16 rotate-[0.8deg] border-y-2 border-cream/15 bg-ink py-3 font-display text-2xl text-grape">
        <Marquee items={["PROMOS", "2x20", "2x22", "2x25", "SOLO ESTA TEMPORADA"]} reverse />
      </div>

      <div className="relative mx-auto max-w-7xl px-5">
        <Reveal className="mb-14 text-center">
          <p className="flex items-center justify-center gap-2 font-hand text-3xl text-roa-300">
            <Sparkle className="h-6 w-6 animate-spin-slow text-mango" />
            llévate dos
          </p>
          <h2 className="mt-1 font-display text-[clamp(3rem,11vw,8rem)] leading-[0.85] text-grape">
            PROMOS
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-cream/60">
            Combos armados para compartir (o no, no juzgamos). Válidos en local y para
            pedidos por WhatsApp.
          </p>
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {promos.map((promo, i) => {
            const theme = THEME[promo.theme] ?? THEME.purple;
            const sample = SAMPLE[promo.categorySlug ?? ""] ?? "Sparkling Mango Pop";

            return (
              <Reveal key={promo.id} delay={i * 90}>
                <article
                  className={`group relative flex h-full flex-col overflow-hidden rounded-[2.5rem] border-2 border-cream ${theme.card} p-7 shadow-[6px_6px_0_var(--color-cream)] transition-all duration-300 hover:-translate-y-2 hover:rotate-1 hover:shadow-[12px_14px_0_var(--color-cream)]`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display text-3xl leading-tight">{promo.title}</h3>
                      {promo.detail && (
                        <p className="mt-2 max-w-[15rem] text-sm italic opacity-70">
                          {promo.detail}
                        </p>
                      )}
                    </div>
                    <div
                      className={`grid h-24 w-16 shrink-0 place-items-center rounded-2xl ${theme.art} transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110`}
                    >
                      <CupArt
                        name={sample}
                        categorySlug={promo.categorySlug ?? "sparkling-tea"}
                        className="h-20"
                        animated={false}
                      />
                    </div>
                  </div>

                  <div className="mt-auto pt-8">
                    <p className="font-display text-[clamp(3.5rem,9vw,5rem)] leading-[0.8] tracking-tighter">
                      {promo.label}
                    </p>
                    <p className="mt-2 text-sm font-bold opacity-60">
                      {currency} {promo.price.toFixed(2)} las dos bebidas
                    </p>
                  </div>
                </article>
              </Reveal>
            );
          })}

          {/* Tarjeta CTA final */}
          <Reveal delay={promos.length * 90}>
            <Link
              href="/carta"
              className="group flex h-full min-h-[19rem] flex-col items-center justify-center gap-4 rounded-[2.5rem] border-2 border-dashed border-cream/35 p-7 text-center transition hover:border-cream hover:bg-cream/5"
            >
              <span className="grid h-16 w-16 place-items-center rounded-full border-2 border-cream text-3xl transition-transform duration-300 group-hover:rotate-90">
                →
              </span>
              <span className="font-display text-3xl">Ver la carta completa</span>
              <span className="text-sm text-cream/50">
                Más de 40 bebidas entre té, matcha y cold brew
              </span>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
