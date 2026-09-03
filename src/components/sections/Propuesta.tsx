import Reveal from "@/components/Reveal";
import Leaf, { WaveDivider, Sparkle } from "@/components/Leaf";
import { KodaMark } from "@/components/Logo";
import {
  SlidersIcon,
  SproutIcon,
  PawIcon,
  PinIcon,
  NavigationIcon,
} from "@/components/Icons";
import { mapsLink, wazeLink, type SiteSettings } from "@/lib/settings";
import EventQuoteModal from "@/components/events/EventQuoteModal";
import { parseEventTypes } from "@/lib/events";

const PILARES = [
  {
    Icon: Sparkle,
    title: "Presentación cuidada",
    text: "Capas de color, foams cremosos y vasos que piden foto. Cada bebida sale lista para tu feed.",
    tone: "bg-mango",
  },
  {
    Icon: SlidersIcon,
    title: "Sabores personalizados",
    text: "Sin azúcar, leche sin lactosa, más boba, menos hielo. Tu bebida se arma como tú la tomas.",
    tone: "bg-grape",
  },
  {
    Icon: SproutIcon,
    title: "Alta calidad y natural",
    text: "Selección de matcha, café, té e insumos naturales y de calidad.",
    tone: "bg-roa-300",
  },
  {
    Icon: PawIcon,
    title: "Experiencia cercana",
    text: "Te explicamos qué estás tomando y por qué sabe así. Somos una barra, no una máquina.",
    tone: "bg-taro",
  },
];

/** Tarjeta de pilar. Se comparte entre el carrusel móvil y la grilla. */
function PilarCard({ pilar }: { pilar: (typeof PILARES)[number] }) {
  return (
    <article
      className={`group h-full rounded-[2rem] border-2 border-ink ${pilar.tone} p-6 shadow-[5px_5px_0_var(--color-ink)] transition-all duration-300 hover:-translate-y-2 hover:rotate-[-1.5deg] hover:shadow-[10px_12px_0_var(--color-ink)]`}
    >
      <span className="inline-grid h-14 w-14 place-items-center rounded-2xl border-2 border-ink bg-cream text-ink transition-transform duration-300 group-hover:rotate-12">
        <pilar.Icon className="h-7 w-7" />
      </span>
      <h3 className="mt-5 font-display text-2xl leading-tight">{pilar.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink/70">{pilar.text}</p>
    </article>
  );
}

export default function Propuesta({ settings }: { settings: SiteSettings }) {
  return (
    <section id="propuesta" className="grain relative bg-cream py-24 text-ink">
      <WaveDivider className="absolute -top-1 left-0 h-14 w-full text-cream" flip />
      <Leaf className="pointer-events-none absolute right-4 top-16 h-64 rotate-[25deg] text-roa-200" />

      <div className="relative mx-auto max-w-7xl px-5">
        <Reveal className="max-w-3xl">
          <p className="font-hand text-3xl text-roa-500">nuestra propuesta</p>
          <h2 className="mt-2 font-display text-[clamp(2.6rem,7vw,5rem)] leading-[0.9]">
            No solo servimos
            <br />
            <span className="text-roa-500">bebidas</span>
          </h2>
          <p className="mt-5 max-w-xl text-lg text-ink/60">
            Roa Brew crea experiencias únicas a través de bebidas artesanales elaboradas
            mediante distintas técnicas de brewing: matcha, café de especialidad y té.
          </p>
        </Reveal>

        {/* En móvil los cuatro pilares se apilaban y obligaban a scrollear
            mucho; van en carrusel. Se mueve con el dedo y no solo: una cinta
            automática obliga a esperar a que vuelva la tarjeta que interesaba.
            El scroll-snap encuadra cada tarjeta al soltar, y el ancho menor
            al de la pantalla deja asomar la siguiente, que es lo que avisa de
            que hay más. Desde sm entran las cuatro a la vez, así que ahí
            conviene la grilla. */}
        <div className="no-scrollbar -mx-5 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-5 px-5 pb-5 sm:hidden">
          {PILARES.map((p) => (
            <div key={p.title} className="flex w-[78vw] max-w-[18rem] shrink-0 snap-start">
              <PilarCard pilar={p} />
            </div>
          ))}
        </div>

        <div className="mt-14 hidden gap-5 sm:grid sm:grid-cols-2 lg:grid-cols-4">
          {PILARES.map((p, i) => (
            <Reveal key={p.title} delay={i * 90}>
              <PilarCard pilar={p} />
            </Reveal>
          ))}
        </div>

        {/* Bloque doble: el local y los eventos */}
        <div className="mt-20 grid gap-5 lg:grid-cols-2">
          <Reveal>
            <article className="relative flex h-full flex-col overflow-hidden rounded-[2.5rem] border-2 border-ink bg-roa-600 p-8 text-cream shadow-[6px_6px_0_var(--color-ink)] sm:p-10">
              <KodaMark className="absolute -right-6 -top-6 h-40 w-40 text-roa-500" />
              <p className="relative font-hand text-2xl text-roa-200">01</p>
              <h3 className="relative mt-1 font-display text-4xl">Pop Up House</h3>
              <p className="relative mt-3 max-w-sm text-cream/75">
                Venta al por menor en nuestra casa Pop Up. Ven, elige tu bebida y mírala
                armarse capa por capa frente a ti.
              </p>

              {/* Cómo llegar: se abre la app de navegación del cliente */}
              <div className="relative mt-auto flex flex-wrap gap-2 pt-6">
                <a
                  href={mapsLink(settings)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-cream px-4 py-2.5 text-sm font-bold text-ink transition hover:-translate-y-0.5 hover:bg-mango"
                >
                  <PinIcon className="h-4.5 w-4.5" />
                  Google Maps
                </a>
                <a
                  href={wazeLink(settings)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-cream px-4 py-2.5 text-sm font-bold text-ink transition hover:-translate-y-0.5 hover:bg-[#33CCFF]"
                >
                  <NavigationIcon className="h-4.5 w-4.5" />
                  Waze
                </a>
              </div>
            </article>
          </Reveal>

          <Reveal delay={120}>
            <article className="relative flex h-full flex-col overflow-hidden rounded-[2.5rem] border-2 border-ink bg-ink p-8 text-cream shadow-[6px_6px_0_var(--color-roa-500)] sm:p-10">
              <p className="font-hand text-2xl text-grape">02</p>
              <h3 className="mt-1 font-display text-4xl">Eventos y ferias</h3>
              <p className="mt-3 max-w-sm text-cream/70">
                Ofrecemos una experiencia completa de bebidas para eventos, ferias, Pop Up
                y corporativos. Barra montada, personalización según temática.
              </p>
              {/* mt-auto lo empuja al fondo de la tarjeta y pt-8 garantiza el
                  aire con el texto aunque la tarjeta sea corta */}
              <div className="mt-auto pt-8">
                <EventQuoteModal
                  eventTypes={parseEventTypes(settings.eventTypes)}
                  whatsapp={settings.whatsapp}
                  className="inline-flex w-fit items-center gap-2 rounded-full border-2 border-cream px-5 py-2.5 font-bold transition hover:bg-cream hover:text-ink"
                />
              </div>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
