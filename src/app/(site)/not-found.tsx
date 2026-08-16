import Link from "next/link";
import CupArt from "@/components/CupArt";
import BobaField from "@/components/BobaField";

export default function NotFound() {
  return (
    <div className="grain relative grid min-h-dvh place-items-center overflow-hidden bg-roa-900 px-5 py-32 text-center">
      <BobaField count={14} />
      <div className="relative">
        <div className="mx-auto w-fit animate-float">
          <CupArt name="Berrys Chaos" categorySlug="sparkling-tea" className="h-48" />
        </div>
        <h1 className="mt-8 font-display text-[clamp(3.5rem,14vw,9rem)] leading-none text-cream">
          404
        </h1>
        <p className="mt-2 font-hand text-3xl text-roa-300">
          esta bebida no existe (todavía)
        </p>
        <p className="mx-auto mt-4 max-w-sm text-cream/60">
          La página que buscas se derramó. Pero la carta sigue servida.
        </p>
        <Link
          href="/carta"
          className="mt-8 inline-block rounded-full border-2 border-ink bg-mango px-8 py-4 font-display text-xl text-ink shadow-[5px_5px_0_var(--color-ink)] transition hover:translate-x-[-3px] hover:translate-y-[-3px]"
        >
          Ir a la carta
        </Link>
      </div>
    </div>
  );
}
