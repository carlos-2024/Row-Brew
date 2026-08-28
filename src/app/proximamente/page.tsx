import type { Metadata } from "next";
import CountdownTimer from "@/components/CountdownTimer";
import CupArt from "@/components/CupArt";
import BobaField from "@/components/BobaField";
import Marquee from "@/components/Marquee";
import Logo from "@/components/Logo";
import Leaf, { Sparkle } from "@/components/Leaf";
import { WhatsAppIcon, InstagramIcon, TikTokIcon, PinIcon } from "@/components/Icons";
import { getSettings, mapsLink } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Muy pronto",
  description:
    "Roa Brew está por lanzar su web. Matcha, café de especialidad y té con popping boba en Los Olivos, Lima.",
};

const TICKER = [
  "MUY PRONTO",
  "MATCHA JAPONÉS",
  "COLD BREW 18 HRS",
  "SPARKLING TEA",
  "HECHO A MANO",
];

export default async function ProximamentePage() {
  const settings = await getSettings();
  const wa = `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`;

  const fecha = new Date(settings.launchDate);
  const fechaLarga = Number.isNaN(fecha.getTime())
    ? null
    : new Intl.DateTimeFormat("es-PE", {
        day: "numeric",
        month: "long",
        timeZone: "America/Lima",
      }).format(fecha);

  return (
    <main className="grain relative flex min-h-dvh flex-col overflow-hidden bg-roa-500">
      {/* Atmósfera */}
      <div className="glow pointer-events-none absolute -left-40 top-0 h-[34rem] w-[34rem] opacity-50" />
      <div className="glow pointer-events-none absolute -right-32 bottom-10 h-[30rem] w-[30rem] opacity-40" />
      <Leaf className="pointer-events-none absolute -left-24 top-10 h-[24rem] rotate-[18deg] text-roa-700/40 animate-float-slow" />
      <Leaf className="pointer-events-none absolute -right-28 bottom-24 h-[28rem] -rotate-[40deg] text-roa-700/35 animate-float" />
      <BobaField count={24} />

      <div className="relative flex flex-1 flex-col items-center justify-center px-5 py-16 text-center">
        <Logo className="text-[clamp(28px,6vw,42px)]" tone="cream" />

        {/* El saludo es el titular: va en la manuscrita, que es la voz
            cercana de la marca. */}
        <h1 className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 font-hand text-[clamp(3rem,11vw,6.5rem)] leading-[0.95] text-cream">
          <Sparkle className="h-7 w-7 shrink-0 animate-spin-slow text-mango sm:h-9 sm:w-9" />
          {settings.launchTitle}
          <Sparkle className="h-7 w-7 shrink-0 animate-spin-slow text-mango sm:h-9 sm:w-9" />
        </h1>

        <p className="mt-6 max-w-2xl text-[clamp(1.05rem,2.5vw,1.45rem)] leading-relaxed text-cream/85">
          {settings.launchSubtitle}
        </p>

        {/* Cuenta regresiva */}
        <div className="mt-10">
          <CountdownTimer target={settings.launchDate} />
          {fechaLarga && (
            <p className="mt-5 font-hand text-2xl text-cream/85">
              nos vemos el {fechaLarga}
            </p>
          )}
        </div>

        {/* Trío de vasos */}
        <div
          className="mt-12 flex items-end justify-center gap-3 sm:gap-6"
          aria-hidden
        >
          {[
            { name: "Iced Matcha Latte", cat: "matcha", tone: "bg-cream", h: "h-24 sm:h-32" },
            { name: "Sparkling MaracuMango", cat: "sparkling-tea", tone: "bg-mango", h: "h-28 sm:h-40" },
            { name: "Mont Blanc by Roa Brew", cat: "cold-brew", tone: "bg-grape", h: "h-24 sm:h-32" },
          ].map((v, i) => (
            <div
              key={v.name}
              className={`rounded-[1.6rem] border-2 border-ink ${v.tone} p-3 shadow-[5px_5px_0_var(--color-ink)] sm:rounded-[2rem] sm:p-4`}
              style={{
                animation: `float ${7 + i}s ease-in-out ${i * 0.8}s infinite`,
              }}
            >
              <CupArt name={v.name} categorySlug={v.cat} className={v.h} />
            </div>
          ))}
        </div>

        {/* Contacto: aunque la web no esté, se puede pedir */}
        <div className="mt-12">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cream/60">
            Mientras tanto, pide por acá
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-shine inline-flex items-center gap-2.5 rounded-full border-2 border-ink bg-[#25D366] px-7 py-4 font-display text-xl text-ink shadow-[5px_5px_0_var(--color-ink)] transition hover:translate-x-[-3px] hover:translate-y-[-3px]"
            >
              <WhatsAppIcon className="h-6 w-6" />
              {settings.whatsappDisplay}
            </a>

            {[
              {
                href: `https://instagram.com/${settings.instagram}`,
                Icon: InstagramIcon,
                label: `Instagram @${settings.instagram}`,
              },
              {
                href: `https://tiktok.com/@${settings.tiktok}`,
                Icon: TikTokIcon,
                label: `TikTok @${settings.tiktok}`,
              },
            ].map(({ href, Icon, label }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="grid h-14 w-14 place-items-center rounded-full border-2 border-cream text-cream transition hover:scale-110 hover:bg-cream hover:text-roa-700"
              >
                <Icon className="h-6 w-6" />
              </a>
            ))}
          </div>

          <a
            href={mapsLink(settings)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 text-sm text-cream/70 underline-offset-4 transition hover:text-cream hover:underline"
          >
            <PinIcon className="h-4 w-4" />
            {settings.location}
          </a>
        </div>
      </div>

      {/* Cinta inferior */}
      <div className="relative -rotate-[1deg] border-y-2 border-ink bg-grape py-3 font-display text-xl text-ink">
        <Marquee items={TICKER} />
      </div>
    </main>
  );
}
