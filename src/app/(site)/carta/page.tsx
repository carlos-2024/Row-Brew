import { nombreProductos } from "@/lib/format";
import type { Metadata } from "next";
import MenuExplorer from "@/components/MenuExplorer";
import BobaField from "@/components/BobaField";
import Leaf from "@/components/Leaf";
import Marquee from "@/components/Marquee";
import { getSettings } from "@/lib/settings";
import { getExtras, getMenu } from "@/lib/menu";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Carta",
  description:
    "Sparkling Tea con popping boba, matcha ceremonial, milk tea con tapioca y cold brew de 18 horas. Arma tu pedido y envíalo por WhatsApp.",
};

export default async function CartaPage() {
  const [settings, categories, extras] = await Promise.all([
    getSettings(),
    getMenu(),
    getExtras(),
  ]);

  const total = categories.reduce((s, c) => s + c.products.length, 0);

  return (
    <div className="bg-roa-900">
      {/* Encabezado */}
      <header className="grain relative overflow-hidden bg-roa-900 px-5 pb-10 pt-40 sm:pt-48">
        <div className="glow pointer-events-none absolute left-1/4 top-0 h-96 w-[36rem] opacity-45" />
        <Leaf className="pointer-events-none absolute -right-16 top-20 h-72 -rotate-[30deg] text-roa-700/40" />
        <BobaField count={14} />

        <div className="relative mx-auto max-w-7xl">
          <p className="font-hand text-3xl text-roa-300">nuestra carta</p>
          <h1 className="mt-1 font-display text-[clamp(3rem,12vw,8rem)] leading-[0.84] text-cream">
            TODO EL
            <br />
            <span className="text-mango">MENÚ</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-cream/65">
            {total} {nombreProductos(categories.map((c) => c.kind), total)} entre té,
            matcha, café de especialidad y algo para acompañar. Toca{" "}
            <strong className="text-cream">Agregar</strong> para armar tu pedido y
            envíalo por WhatsApp en un toque.
          </p>

          {extras.length > 0 && (
            <div className="mt-7 flex flex-wrap gap-2">
              <span className="rounded-full bg-cream/10 px-4 py-2 text-sm font-bold text-cream/70">
                Extras disponibles:
              </span>
              {extras.map((e) => (
                <span
                  key={e.id}
                  className="rounded-full border-2 border-cream/20 px-4 py-2 text-sm font-bold text-cream/80"
                >
                  {e.name} +{settings.currency} {e.price.toFixed(0)}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      <div className="-rotate-[0.6deg] border-y-2 border-ink bg-mango py-2.5 font-display text-lg text-ink">
        <Marquee
          items={[
            "PUEDES PEDIRLO SIN AZÚCAR",
            "LECHE SIN LACTOSA DISPONIBLE",
            "NO OLVIDES REMOVER TU BEBIDA BREW BREW",
          ]}
          reverse
        />
      </div>

      {/* Carta */}
      <div className="mx-auto max-w-7xl px-5 py-14">
        {categories.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-display text-4xl text-cream">La carta está cargando…</p>
            <p className="mt-3 text-cream/55">
              Si esto no cambia, corre{" "}
              <code className="rounded bg-cream/10 px-2 py-1">npm run db:seed</code> para
              poblar la base de datos.
            </p>
          </div>
        ) : (
          <MenuExplorer
            categories={categories}
            extras={extras}
            currency={settings.currency}
          />
        )}
      </div>
    </div>
  );
}
