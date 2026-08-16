import Link from "next/link";
import Reveal from "@/components/Reveal";
import CupArt from "@/components/CupArt";
import Leaf from "@/components/Leaf";
import type { MenuCategory } from "@/lib/types";

const THEME: Record<
  string,
  { block: string; text: string; sub: string; cup: string }
> = {
  green: {
    block: "bg-roa-500",
    text: "text-cream",
    sub: "text-roa-100",
    cup: "bg-roa-400",
  },
  cream: {
    block: "bg-cream",
    text: "text-ink",
    sub: "text-roa-600",
    cup: "bg-roa-200",
  },
  black: {
    block: "bg-ink",
    text: "text-cream",
    sub: "text-roa-300",
    cup: "bg-roa-800",
  },
  purple: {
    block: "bg-grape",
    text: "text-ink",
    sub: "text-grape-deep",
    cup: "bg-taro",
  },
};

const SAMPLE: Record<string, string> = {
  "sparkling-tea": "Berrys Chaos",
  matcha: "Pistacho Matcha Foam",
  "cold-brew": "Golden Cold Brew",
  "milk-tea": "Taro Fresita",
};

export default function Familias({
  categories,
  currency,
}: {
  categories: MenuCategory[];
  currency: string;
}) {
  if (categories.length === 0) return null;

  return (
    <section className="grain relative overflow-hidden bg-roa-800 py-24">
      <Leaf className="pointer-events-none absolute -left-20 bottom-10 h-80 rotate-[200deg] text-roa-700/50" />

      <div className="relative mx-auto max-w-7xl px-5">
        <Reveal className="mb-14 max-w-2xl">
          <p className="font-hand text-3xl text-roa-300">cuatro mundos</p>
          <h2 className="mt-1 font-display text-[clamp(2.6rem,7.5vw,5.5rem)] leading-[0.88] text-cream">
            Elige tu
            <br />
            familia
          </h2>
        </Reveal>

        <div className="grid gap-5 md:grid-cols-2">
          {categories.map((cat, i) => {
            const theme = THEME[cat.theme] ?? THEME.green;
            const cheapest = Math.min(...cat.products.map((p) => p.price));

            return (
              <Reveal key={cat.slug} delay={i * 90}>
                <Link
                  href={`/carta#${cat.slug}`}
                  className={`group relative flex h-full min-h-[16rem] items-center gap-6 overflow-hidden rounded-[2.5rem] border-2 border-ink ${theme.block} p-7 shadow-[6px_6px_0_var(--color-ink)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[12px_14px_0_var(--color-ink)] sm:p-9`}
                >
                  <div className="relative z-10 flex-1">
                    <p className={`font-hand text-2xl ${theme.sub}`}>{cat.tagline}</p>
                    <h3
                      className={`mt-1 font-display text-[clamp(2rem,5vw,3.2rem)] leading-none ${theme.text}`}
                    >
                      {cat.name}
                    </h3>
                    <p className={`mt-3 max-w-xs text-sm opacity-70 ${theme.text}`}>
                      {cat.description}
                    </p>
                    <p
                      className={`mt-5 inline-flex items-center gap-2 font-bold ${theme.text}`}
                    >
                      Desde {currency} {cheapest.toFixed(0)}
                      <span className="transition-transform duration-300 group-hover:translate-x-1.5">
                        →
                      </span>
                    </p>
                  </div>

                  <div
                    className={`relative grid h-40 w-28 shrink-0 place-items-center rounded-[1.8rem] ${theme.cup} transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110`}
                  >
                    <CupArt
                      name={SAMPLE[cat.slug] ?? cat.products[0]?.name ?? cat.name}
                      categorySlug={cat.slug}
                      className="h-36"
                    />
                  </div>

                  {/* Número grande de fondo */}
                  <span
                    className={`pointer-events-none absolute -bottom-8 right-4 font-display text-[9rem] leading-none opacity-[0.07] ${theme.text}`}
                  >
                    0{i + 1}
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
