import Link from "next/link";
import CupArt from "@/components/CupArt";
import BobaField from "@/components/BobaField";
import Leaf, { Sparkle } from "@/components/Leaf";
import Marquee from "@/components/Marquee";
import type { SiteSettings } from "@/lib/settings";

const TICKER = [
  "CAFÉ DE ESPECIALIDAD",
  "SIN AZÚCARES",
  "COLD BREW +18HRS",
  "HECHO A MANO",
];

const DATOS = [
  ["Matcha", "japonés"],
  ["Café", "peruano"],
  ["Promos", "disponibles"],
  ["100%", "natural & calidad"],
];

export default function Hero({ settings }: { settings: SiteSettings }) {
  return (
    <section className="grain relative flex min-h-dvh flex-col justify-center overflow-hidden bg-roa-500 pb-16 pt-40 sm:pt-48">
      {/* Atmósfera */}
      <div className="glow pointer-events-none absolute -left-40 top-10 h-[34rem] w-[34rem] opacity-60" />
      <div className="glow pointer-events-none absolute -right-32 bottom-0 h-[30rem] w-[30rem] opacity-40" />
      <Leaf className="pointer-events-none absolute -left-24 top-24 h-[26rem] rotate-[18deg] text-roa-700/40 animate-float-slow" />
      <Leaf className="pointer-events-none absolute -right-28 top-40 h-[32rem] -rotate-[35deg] text-roa-700/30 animate-float" />
      <BobaField count={22} />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-5 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Copy */}
        <div>
          <p className="flex items-center gap-3 font-hand text-[clamp(2.2rem,6vw,3.4rem)] leading-none text-cream/90">
            <Sparkle className="h-7 w-7 animate-spin-slow text-grape" />
            {settings.heroKicker}
          </p>

          <h1 className="mt-3 font-display text-cream">
            <span className="block text-[clamp(2.9rem,8.5vw,6.2rem)] leading-[0.86]">
              Bebidas
              <br />
              <span className="relative inline-block">
                <span className="relative z-10">de autor</span>
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-1 z-0 h-[0.32em] -rotate-1 rounded-full bg-grape/80"
                />
              </span>
            </span>
            <span className="mt-3 block max-w-xl text-[clamp(1.35rem,3.4vw,2.3rem)] leading-[1.08] text-cream/85">
              pensadas para disfrutar y compartir
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-relaxed text-cream/90">
            {settings.heroSubtitle}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/carta"
              className="btn-shine rounded-full border-2 border-ink bg-mango px-8 py-4 font-display text-xl text-ink shadow-[5px_5px_0_var(--color-ink)] transition hover:translate-x-[-3px] hover:translate-y-[-3px] hover:shadow-[9px_9px_0_var(--color-ink)]"
            >
              Ver la carta
            </Link>
            <a
              href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border-2 border-cream px-8 py-4 font-display text-xl text-cream transition hover:bg-cream hover:text-roa-900"
            >
              Pedir ahora
            </a>
          </div>

          <dl className="mt-9 flex flex-wrap gap-x-7 gap-y-4">
            {DATOS.map(([n, label]) => (
              <div key={label} className="max-w-[11rem]">
                <dt className="font-display text-2xl leading-none text-cream">{n}</dt>
                <dd className="mt-1 text-xs leading-snug text-cream/70">{label}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Trío de vasos flotando */}
        <div className="relative mx-auto grid h-[26rem] w-full max-w-md place-items-center sm:h-[32rem]">
          <div className="absolute left-0 top-8 animate-float-slow">
            <div className="rounded-[2.5rem] border-2 border-ink bg-cream/95 p-4 shadow-[7px_7px_0_var(--color-ink)]">
              <CupArt
                name="Iced Matcha Latte"
                categorySlug="matcha"
                className="h-40 sm:h-52"
              />
              <p className="mt-1 text-center font-display text-sm text-ink">Matcha</p>
            </div>
          </div>

          <div className="absolute right-2 top-0 animate-float" style={{ animationDelay: "1.2s" }}>
            <div className="rounded-[2.5rem] border-2 border-ink bg-mango p-4 shadow-[7px_7px_0_var(--color-ink)]">
              <CupArt
                name="Sparkling MaracuMango"
                categorySlug="sparkling-tea"
                className="h-36 sm:h-48"
              />
              <p className="mt-1 text-center font-display text-sm text-ink">Sparkling</p>
            </div>
          </div>

          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 animate-float-slow"
            style={{ animationDelay: "2.4s" }}
          >
            <div className="rounded-[2.5rem] border-2 border-ink bg-grape p-4 shadow-[7px_7px_0_var(--color-ink)]">
              <CupArt
                name="Cold Brew"
                categorySlug="cold-brew"
                className="h-36 sm:h-48"
              />
              <p className="mt-1 text-center font-display text-sm text-ink">Café</p>
            </div>
          </div>

          {/* Sello giratorio */}
          <div className="absolute -bottom-2 right-0 grid h-24 w-24 place-items-center rounded-full border-2 border-ink bg-cream text-center sm:h-28 sm:w-28">
            <span className="font-display text-xs leading-tight text-ink">
              Los
              <br />
              Olivos
              <br />
              Lima
            </span>
          </div>
        </div>
      </div>

      {/* Ticker inferior */}
      <div className="relative mt-14 -rotate-[1.2deg] border-y-2 border-ink bg-grape py-3 font-display text-xl text-ink">
        <Marquee items={TICKER} />
      </div>
    </section>
  );
}
