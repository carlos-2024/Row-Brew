import type { Metadata } from "next";
import LoyaltyLookup from "@/components/loyalty/LoyaltyLookup";
import StampCard from "@/components/loyalty/StampCard";
import BobaField from "@/components/BobaField";
import Reveal from "@/components/Reveal";
import Leaf, { Sparkle } from "@/components/Leaf";
import Marquee from "@/components/Marquee";
import { LOYALTY_GOAL, LOYALTY_MID_GOAL, loyaltyStatus } from "@/lib/loyalty";

export const metadata: Metadata = {
  title: "Tarjeta de fidelidad",
  description:
    "Junta sellos con cada bebida. A los 5 agrandas o pides una cortesía, a los 10 tu bebida va gratis.",
};

const PASOS = [
  {
    n: "01",
    title: "Pide tu bebida",
    text: "Cualquier bebida de la carta suma un sello. Sin mínimo, sin letra chica.",
  },
  {
    n: "02",
    title: "Da tu DNI en barra",
    text: "Con eso te sellamos la tarjeta al instante. No tienes que cargar nada físico.",
  },
  {
    n: "03",
    title: "Consulta cuando quieras",
    text: "Entra acá, pon tu DNI y mira cuántos sellos llevas y qué tienes desbloqueado.",
  },
];

export default function FidelidadPage() {
  // Tarjeta de ejemplo para la sección explicativa
  const demo = loyaltyStatus({
    stamps: 6,
    cycles: 1,
    totalStamps: 16,
    midRewardUsed: false,
    birthday: new Date(Date.UTC(1996, 4, 14)),
    birthdayRewardYear: null,
  });

  return (
    <>
      {/* Consulta */}
      <section className="grain relative overflow-hidden bg-roa-900 px-5 pb-20 pt-40 sm:pt-48">
        <div className="glow pointer-events-none absolute left-1/2 top-10 h-96 w-[38rem] -translate-x-1/2 opacity-45" />
        <Leaf className="pointer-events-none absolute -right-20 top-24 h-80 -rotate-[35deg] text-roa-700/40" />
        <BobaField count={16} />

        <div className="relative mx-auto max-w-3xl text-center">
          <p className="flex items-center justify-center gap-3 font-hand text-3xl text-roa-300">
            <Sparkle className="h-6 w-6 animate-spin-slow text-mango" />
            programa brew brew
          </p>
          <h1 className="mt-2 font-display text-[clamp(2.8rem,10vw,6rem)] leading-[0.86] text-cream">
            Junta sellos,
            <br />
            <span className="text-mango">toma gratis</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-cream/75">
            Cada bebida suma un sello. A los <strong className="text-cream">{LOYALTY_MID_GOAL}</strong>{" "}
            agrandas tu bebida o pides una de cortesía. A los{" "}
            <strong className="text-cream">{LOYALTY_GOAL}</strong>, la siguiente va por
            la casa. Y en tu cumpleaños,{" "}
            <strong className="text-cream">una bebida de regalo</strong>.
          </p>

          <div className="mt-12">
            <LoyaltyLookup />
          </div>
        </div>
      </section>

      <div className="-rotate-[0.7deg] border-y-2 border-ink bg-mango py-2.5 font-display text-lg text-ink">
        <Marquee
          items={[
            `${LOYALTY_MID_GOAL} SELLOS · AGRANDA O CORTESÍA`,
            `${LOYALTY_GOAL} SELLOS · BEBIDA GRATIS`,
            "CUMPLEAÑOS · BEBIDA DE REGALO",
            "SIN MÍNIMO DE CONSUMO",
            "TU DNI ES TU TARJETA",
          ]}
        />
      </div>

      {/* Cómo funciona */}
      <section className="grain relative bg-cream py-24 text-ink">
        <div className="mx-auto max-w-7xl px-5">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <Reveal>
              <p className="font-hand text-3xl text-roa-500">así funciona</p>
              <h2 className="mt-1 font-display text-[clamp(2.4rem,6vw,4rem)] leading-[0.9]">
                Tres pasos
                <br />y ya
              </h2>

              <ol className="mt-8 space-y-3">
                {PASOS.map((p) => (
                  <li
                    key={p.n}
                    className="group flex gap-5 rounded-[1.6rem] border-2 border-ink bg-white/55 p-5 shadow-[4px_4px_0_var(--color-ink)] transition-all duration-300 hover:-translate-x-1.5 hover:bg-roa-100 hover:shadow-[9px_9px_0_var(--color-ink)]"
                  >
                    <span className="font-display text-3xl leading-none text-roa-300 transition-colors group-hover:text-roa-500">
                      {p.n}
                    </span>
                    <div>
                      <h3 className="font-display text-xl leading-tight">{p.title}</h3>
                      <p className="mt-1 text-sm text-ink/60">{p.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Reveal>

            <Reveal delay={140}>
              <p className="mb-4 text-center font-hand text-2xl text-roa-500">
                así se ve tu tarjeta
              </p>
              <StampCard status={demo} name="Carlos B." dni="4••••789" />
            </Reveal>
          </div>

          <Reveal delay={200}>
            <p className="mx-auto mt-16 max-w-2xl text-center text-sm text-ink/45">
              Los sellos se cargan únicamente en barra al momento de la compra. Los
              premios se canjean en local y no son acumulables entre sí ni canjeables
              por dinero. Al registrarte aceptas que guardemos tu nombre y documento
              para identificar tu tarjeta.
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
