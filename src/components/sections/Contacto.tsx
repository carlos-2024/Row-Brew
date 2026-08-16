import Reveal from "@/components/Reveal";
import BobaField from "@/components/BobaField";
import Leaf from "@/components/Leaf";
import {
  WhatsAppIcon,
  InstagramIcon,
  TikTokIcon,
  PinIcon,
  ClockIcon,
} from "@/components/Icons";
import type { SiteSettings } from "@/lib/settings";

export default function Contacto({ settings }: { settings: SiteSettings }) {
  const wa = `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`;

  const CANALES = [
    {
      label: "WhatsApp",
      value: settings.whatsappDisplay,
      href: wa,
      Icon: WhatsAppIcon,
      tone: "bg-[#25D366] text-ink",
    },
    {
      label: "Instagram",
      value: `@${settings.instagram}`,
      href: `https://instagram.com/${settings.instagram}`,
      Icon: InstagramIcon,
      tone: "bg-grape text-ink",
    },
    {
      label: "TikTok",
      value: `@${settings.tiktok}`,
      href: `https://tiktok.com/@${settings.tiktok}`,
      Icon: TikTokIcon,
      tone: "bg-cream text-ink",
    },
  ];

  return (
    <section
      id="contacto"
      className="grain relative overflow-hidden bg-roa-600 py-24 text-cream"
    >
      <BobaField count={16} />
      <Leaf className="pointer-events-none absolute -right-24 top-0 h-96 rotate-[145deg] text-roa-700/45" />

      <div className="relative mx-auto max-w-5xl px-5 text-center">
        <Reveal>
          <p className="font-hand text-3xl text-roa-200">¿nos escribimos?</p>
          <h2 className="mt-2 font-display text-[clamp(2.8rem,9vw,6.5rem)] leading-[0.85]">
            Pide tu brew
            <br />
            <span className="text-mango">ahora mismo</span>
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-lg text-cream/70">
            Escríbenos por WhatsApp para pedidos, delivery o para cotizar la barra de tu
            evento. Respondemos rapidito.
          </p>
        </Reveal>

        <Reveal delay={120}>
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-shine mt-10 inline-block rounded-full border-2 border-ink bg-mango px-10 py-5 font-display text-2xl text-ink shadow-[6px_6px_0_var(--color-ink)] transition hover:translate-x-[-3px] hover:translate-y-[-3px] hover:shadow-[11px_11px_0_var(--color-ink)] sm:text-3xl"
          >
            Escribir por WhatsApp
          </a>
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          {CANALES.map((c, i) => (
            <Reveal key={c.label} delay={200 + i * 90}>
              <a
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex h-full flex-col items-center gap-1 rounded-[1.8rem] border-2 border-ink ${c.tone} p-6 shadow-[5px_5px_0_var(--color-ink)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[9px_11px_0_var(--color-ink)]`}
              >
                <c.Icon className="h-9 w-9 transition-transform duration-300 group-hover:scale-125" />
                <span className="mt-1 text-xs font-black uppercase tracking-widest opacity-55">
                  {c.label}
                </span>
                <span className="font-display text-xl">{c.value}</span>
              </a>
            </Reveal>
          ))}
        </div>

        <Reveal delay={480}>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-cream/65">
            <span className="flex items-center gap-2">
              <PinIcon className="h-5 w-5 text-roa-200" /> {settings.location}
            </span>
            <span className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-roa-200" /> {settings.schedule}
            </span>
          </div>
          <p className="mt-4 text-sm text-cream/45">{settings.deliveryNote}</p>
        </Reveal>
      </div>
    </section>
  );
}
