import Reveal from "@/components/Reveal";
import Leaf from "@/components/Leaf";
import ZoneChecker from "@/components/ZoneChecker";
import { ScooterIcon, PinIcon } from "@/components/Icons";
import { deliveryMapEmbedUrl, mapsLink, type SiteSettings } from "@/lib/settings";

/**
 * Zonas de cobertura de delivery.
 *
 * El mapa se incrusta desde Google My Maps, así que las zonas que se dibujen
 * allá se reflejan aquí sin tocar código. Los colores de la leyenda siguen los
 * del mapa: naranja para envío gratis, morado para envío con costo.
 */
export default function Cobertura({ settings }: { settings: SiteSettings }) {
  const embedUrl = deliveryMapEmbedUrl(settings);
  if (!embedUrl) return null;

  const ZONAS = [
    {
      color: "bg-mango",
      label: settings.deliveryZoneFreeLabel,
      text: settings.deliveryZoneFreeText,
      destacada: true,
    },
    {
      color: "bg-grape",
      label: settings.deliveryZonePaidLabel,
      text: settings.deliveryZonePaidText,
      destacada: false,
    },
    {
      color: "bg-cream",
      label: settings.deliveryZoneOutsideLabel,
      text: settings.deliveryZoneOutsideText,
      destacada: false,
    },
  ];

  return (
    <section
      id="delivery"
      className="grain relative overflow-hidden bg-roa-800 py-24 text-cream"
    >
      <Leaf className="pointer-events-none absolute -left-24 top-16 h-80 rotate-[15deg] text-roa-700/45" />
      <div className="glow pointer-events-none absolute right-0 top-1/3 h-96 w-[30rem] opacity-35" />

      <div className="relative mx-auto max-w-7xl px-5">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12">
          {/* Texto y leyenda */}
          <Reveal>
            <p className="flex items-center gap-3 font-hand text-3xl text-roa-300">
              <ScooterIcon className="h-8 w-8 text-mango" />
              llevamos hasta tu puerta
            </p>
            <h2 className="mt-2 font-display text-[clamp(2.4rem,6.5vw,4.5rem)] leading-[0.88]">
              Zonas de
              <br />
              <span className="text-mango">delivery</span>
            </h2>
            <p className="mt-5 max-w-md text-cream/70">
              Busca tu dirección en el mapa y mira en qué zona caes. Si no estás en
              ninguna, tranquilo: igual te llevamos.
            </p>

            <ul className="mt-8 space-y-3">
              {ZONAS.map((z) => (
                <li
                  key={z.label}
                  className={`flex gap-4 rounded-2xl border-2 p-4 transition ${
                    z.destacada
                      ? "border-ink bg-roa-900 shadow-[4px_4px_0_var(--color-ink)]"
                      : "border-cream/15 bg-roa-900/60"
                  }`}
                >
                  <span
                    className={`mt-0.5 h-6 w-6 shrink-0 rounded-md border-2 border-ink ${z.color}`}
                    aria-hidden
                  />
                  <div>
                    <p className="font-display text-xl leading-none">{z.label}</p>
                    <p className="mt-1.5 text-sm text-cream/65">{z.text}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <ZoneChecker whatsapp={settings.whatsapp} />
            </div>

            <a
              href={mapsLink(settings)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-full border-2 border-cream/30 px-6 py-3 font-bold text-cream transition hover:border-cream hover:bg-cream/10"
            >
              <PinIcon className="h-5 w-5" />
              Ver el local en el mapa
            </a>
          </Reveal>

          {/* Mapa */}
          <Reveal delay={120}>
            <div className="overflow-hidden rounded-[2rem] border-2 border-ink bg-cream shadow-[7px_7px_0_var(--color-ink)]">
              <iframe
                src={embedUrl}
                title="Zonas de cobertura de delivery de Roa Brew"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="block h-[26rem] w-full border-0 sm:h-[32rem]"
              />
              <p className="border-t-2 border-ink/10 bg-cream-2 px-4 py-3 text-center text-xs text-ink/50">
                Mapa referencial. La zona exacta se confirma al coordinar tu pedido
                por WhatsApp.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
