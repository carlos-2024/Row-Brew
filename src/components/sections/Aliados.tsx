import Link from "next/link";
import Reveal from "@/components/Reveal";
import Leaf from "@/components/Leaf";
import type { AllySummary } from "@/lib/types";

/**
 * "Conoce lo que tomas": el listado de marcas aliadas.
 *
 * Aquí solo van nombre, texto e imagen. La historia completa, la galería y
 * los productos viven en la página de cada aliado, para no cargar el inicio.
 */
export default function Aliados({ allies }: { allies: AllySummary[] }) {
  if (allies.length === 0) return null;

  return (
    <section
      id="aliados"
      className="grain relative overflow-hidden bg-roa-800 py-24 text-cream"
    >
      <Leaf className="pointer-events-none absolute -right-24 top-20 h-80 -rotate-[25deg] text-roa-700/45" />
      <div className="glow pointer-events-none absolute left-0 top-1/3 h-96 w-[28rem] opacity-30" />

      <div className="relative mx-auto max-w-7xl px-5">
        <Reveal className="mb-12 max-w-2xl">
          <p className="font-hand text-3xl text-roa-300">conoce lo que tomas</p>
          <h2 className="mt-1 font-display text-[clamp(2.4rem,7vw,4.8rem)] leading-[0.88]">
            Nuestros
            <br />
            <span className="text-mango">aliados</span>
          </h2>
          <p className="mt-5 text-cream/70">
            Detrás de cada taza hay productores con nombre propio. Conoce su
            historia y llévate sus productos a casa.
          </p>
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2">
          {allies.map((ally, i) => (
            <Reveal key={ally.id} delay={i * 110}>
              <Link
                href={`/aliados/${ally.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-[2.5rem] border-2 border-ink bg-cream text-ink shadow-[6px_6px_0_var(--color-ink)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[12px_14px_0_var(--color-ink)]"
              >
                {/* Imagen */}
                <div className="relative h-52 overflow-hidden border-b-2 border-ink bg-roa-200">
                  {ally.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={ally.coverUrl}
                      alt={ally.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <span className="grid h-full w-full place-items-center font-display text-6xl text-roa-500/40">
                      {ally.name.charAt(0)}
                    </span>
                  )}

                  {ally.logoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={ally.logoUrl}
                      alt=""
                      className="absolute bottom-3 left-3 h-14 w-14 rounded-2xl border-2 border-ink bg-cream object-cover"
                    />
                  )}

                  {/* Deja claro que ahí también se compra, no solo se lee */}
                  {ally.productCount > 0 && (
                    <span className="absolute right-3 top-3 rounded-full border-2 border-ink bg-mango px-3 py-1 text-xs font-black text-ink">
                      {ally.productCount}{" "}
                      {ally.productCount === 1 ? "producto" : "productos"}
                    </span>
                  )}
                </div>

                {/* Texto */}
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-3xl leading-none">{ally.name}</h3>
                  {ally.tagline && (
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-ink/65">
                      {ally.tagline}
                    </p>
                  )}

                  <span className="mt-5 inline-flex items-center gap-2 font-bold text-roa-700">
                    Conoce la marca
                    <span
                      aria-hidden
                      className="transition-transform duration-300 group-hover:translate-x-1.5"
                    >
                      →
                    </span>
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
