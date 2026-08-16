import Reveal from "@/components/Reveal";
import Marquee from "@/components/Marquee";
import { KodaLogo } from "@/components/Brand";
import { Sparkle, WaveDivider } from "@/components/Leaf";

const PUNTOS = [
  {
    n: "01",
    title: "Estética cuidada",
    text: "Montaje, vasos y capas pensados para que la barra se vea tan bien como la bebida.",
  },
  {
    n: "02",
    title: "Interacción con los asistentes",
    text: "Explicamos cada preparación, dejamos probar y armamos la bebida frente a la gente.",
  },
  {
    n: "03",
    title: "Bebidas instagrameables",
    text: "Degradados, foams y popping boba: contenido que tus invitados van a querer subir.",
  },
  {
    n: "04",
    title: "Personalización por temática",
    text: "Adaptamos nombres, colores y carta al concepto de tu evento o marca.",
  },
];

export default function Experiencia({ note }: { note: string }) {
  return (
    <section id="experiencia" className="grain relative bg-cream py-24 text-ink">
      <WaveDivider className="absolute -top-1 left-0 h-14 w-full text-cream" flip />

      <div className="relative mx-auto max-w-7xl px-5">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <p className="font-hand text-3xl text-roa-500">experiencia roa brew</p>
            <h2 className="mt-2 font-display text-[clamp(2.6rem,7vw,5rem)] leading-[0.88]">
              Creamos una
              <span className="relative mx-2 inline-block">
                <span className="relative z-10">experiencia</span>
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-1 z-0 h-[0.3em] rotate-1 rounded-full bg-mango"
                />
              </span>
              visual y sensorial
            </h2>
            <p className="mt-5 max-w-md text-lg text-ink/60">{note}</p>

            <div className="relative mt-10 inline-block">
              <KodaLogo className="h-40 w-40 animate-wiggle text-roa-500" />
              <Sparkle className="absolute -right-3 top-0 h-7 w-7 animate-spin-slow text-grape" />
            </div>
          </Reveal>

          <Reveal delay={120}>
            <ol className="space-y-3">
              {PUNTOS.map((p, i) => (
                <li
                  key={p.n}
                  className="group flex gap-5 rounded-[1.8rem] border-2 border-ink bg-white/55 p-6 shadow-[4px_4px_0_var(--color-ink)] transition-all duration-300 hover:-translate-x-1.5 hover:bg-roa-100 hover:shadow-[9px_9px_0_var(--color-ink)]"
                  style={{ transitionDelay: `${i * 40}ms` }}
                >
                  <span className="font-display text-4xl leading-none text-roa-300 transition-colors group-hover:text-roa-500">
                    {p.n}
                  </span>
                  <div>
                    <h3 className="font-display text-2xl leading-tight">{p.title}</h3>
                    <p className="mt-1.5 text-sm text-ink/60">{p.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </div>

      <div className="mt-20 -rotate-[0.8deg] border-y-2 border-ink bg-roa-500 py-3 font-display text-xl text-cream">
        <Marquee
          items={[
            "FERIAS",
            "CORPORATIVOS",
            "CUMPLEAÑOS",
            "POP UP",
            "ACTIVACIONES",
            "PICNICS",
          ]}
        />
      </div>
    </section>
  );
}
