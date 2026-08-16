import Reveal from "@/components/Reveal";
import Leaf, { WaveDivider, Sparkle } from "@/components/Leaf";
import { KodaMark } from "@/components/Logo";
import { SlidersIcon, SproutIcon, PawIcon } from "@/components/Icons";

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
    text: "Matcha ceremonial, café de especialidad y fruta natural. Nada de mezclas en polvo.",
    tone: "bg-roa-300",
  },
  {
    Icon: PawIcon,
    title: "Experiencia cercana",
    text: "Te explicamos qué estás tomando y por qué sabe así. Somos una barra, no una máquina.",
    tone: "bg-taro",
  },
];

export default function Propuesta() {
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

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PILARES.map((p, i) => (
            <Reveal key={p.title} delay={i * 90}>
              <article
                className={`group h-full rounded-[2rem] border-2 border-ink ${p.tone} p-6 shadow-[5px_5px_0_var(--color-ink)] transition-all duration-300 hover:-translate-y-2 hover:rotate-[-1.5deg] hover:shadow-[10px_12px_0_var(--color-ink)]`}
              >
                <span className="inline-grid h-14 w-14 place-items-center rounded-2xl border-2 border-ink bg-cream text-ink transition-transform duration-300 group-hover:rotate-12">
                  <p.Icon className="h-7 w-7" />
                </span>
                <h3 className="mt-5 font-display text-2xl leading-tight">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/70">{p.text}</p>
              </article>
            </Reveal>
          ))}
        </div>

        {/* Bloque doble: retail + eventos */}
        <div className="mt-20 grid gap-5 lg:grid-cols-2">
          <Reveal>
            <article className="relative h-full overflow-hidden rounded-[2.5rem] border-2 border-ink bg-roa-600 p-8 text-cream shadow-[6px_6px_0_var(--color-ink)] sm:p-10">
              <KodaMark className="absolute -right-6 -top-6 h-40 w-40 text-roa-500" />
              <p className="relative font-hand text-2xl text-roa-200">01</p>
              <h3 className="relative mt-1 font-display text-4xl">Pop Up House</h3>
              <p className="relative mt-3 max-w-sm text-cream/75">
                Venta al por menor en nuestra casa Pop Up. Ven, elige tu bebida y mírala
                armarse capa por capa frente a ti.
              </p>
            </article>
          </Reveal>

          <Reveal delay={120}>
            <article className="relative h-full overflow-hidden rounded-[2.5rem] border-2 border-ink bg-ink p-8 text-cream shadow-[6px_6px_0_var(--color-roa-500)] sm:p-10">
              <p className="font-hand text-2xl text-grape">02</p>
              <h3 className="mt-1 font-display text-4xl">Eventos y ferias</h3>
              <p className="mt-3 max-w-sm text-cream/70">
                Ofrecemos una experiencia completa de bebidas para eventos, ferias, Pop Up
                y corporativos. Barra montada, personalización según temática.
              </p>
              <a
                href="#contacto"
                className="mt-6 inline-flex items-center gap-2 rounded-full border-2 border-cream px-5 py-2.5 font-bold transition hover:bg-cream hover:text-ink"
              >
                Cotizar mi evento <span aria-hidden>→</span>
              </a>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
