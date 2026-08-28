import Link from "next/link";
import Logo, { KodaMark } from "@/components/Logo";
import Leaf from "@/components/Leaf";
import {
  WhatsAppIcon,
  InstagramIcon,
  TikTokIcon,
  PinIcon,
  ClockIcon,
} from "@/components/Icons";
import { mapsLink, type SiteSettings } from "@/lib/settings";

export default function Footer({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear();

  return (
    <footer className="grain relative overflow-hidden bg-ink pt-20 text-cream">
      <Leaf className="pointer-events-none absolute -left-16 top-10 h-72 rotate-12 text-roa-700/25" />
      <Leaf className="pointer-events-none absolute -right-20 bottom-0 h-96 -rotate-45 text-roa-700/20" />

      <div className="relative mx-auto max-w-7xl px-5">
        <div className="grid gap-12 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <Logo className="text-[34px]" tone="cream" />
            <p className="mt-5 max-w-sm text-cream/60">
              {settings.tagline}. Bebidas artesanales elaboradas con distintas técnicas
              de brewing, cuidando cada detalle en sabor, presentación y experiencia.
            </p>
            <p className="mt-5 font-hand text-3xl text-roa-300">hola brew brew</p>
          </div>

          <nav aria-label="Navegación del pie">
            <h3 className="font-display text-xl text-roa-300">Navega</h3>
            <ul className="mt-4 space-y-2.5 text-cream/70">
              {[
                { href: "/carta", label: "Carta completa" },
                { href: "/#promos", label: "Promos 2x" },
                { href: "/fidelidad", label: "Tarjeta de fidelidad" },
                { href: "/#delivery", label: "Zonas de delivery" },
                { href: "/#experiencia", label: "Eventos y Pop Up" },
                { href: "/#contacto", label: "Contacto" },
                { href: "/admin", label: "Panel interno" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="inline-block transition hover:translate-x-1 hover:text-grape"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div id="contacto-footer">
            <h3 className="font-display text-xl text-roa-300">Escríbenos</h3>

            {/* Redes, con sus marcas reales */}
            <ul className="mt-4 space-y-2">
              {[
                {
                  label: settings.whatsappDisplay,
                  href: `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`,
                  Icon: WhatsAppIcon,
                  hover: "group-hover:bg-[#25D366] group-hover:text-ink",
                },
                {
                  label: `@${settings.instagram}`,
                  href: `https://instagram.com/${settings.instagram}`,
                  Icon: InstagramIcon,
                  hover:
                    "group-hover:bg-gradient-to-tr group-hover:from-[#f9ce34] group-hover:via-[#ee2a7b] group-hover:to-[#6228d7] group-hover:text-cream",
                },
                {
                  label: `@${settings.tiktok}`,
                  href: `https://tiktok.com/@${settings.tiktok}`,
                  Icon: TikTokIcon,
                  hover: "group-hover:bg-cream group-hover:text-ink",
                },
              ].map(({ label, href, Icon, hover }) => (
                <li key={href}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-3 text-cream/70 transition hover:text-cream"
                  >
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-cream/20 transition-all duration-300 group-hover:scale-110 group-hover:border-transparent ${hover}`}
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </span>
                    {label}
                  </a>
                </li>
              ))}
            </ul>

            <ul className="mt-5 space-y-2.5 text-cream/70">
              <li>
                <a
                  href={mapsLink(settings)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-2.5 transition hover:text-grape"
                >
                  <PinIcon className="mt-0.5 h-5 w-5 shrink-0 text-roa-300 transition group-hover:text-grape" />
                  <span className="underline-offset-4 group-hover:underline">
                    {settings.location}
                  </span>
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <ClockIcon className="mt-0.5 h-5 w-5 shrink-0 text-roa-300" />
                {settings.schedule}
              </li>
            </ul>
          </div>
        </div>

        {/* Wordmark gigante recortado abajo */}
        <div className="relative mt-16 select-none overflow-hidden">
          <p className="translate-y-[14%] text-center font-display text-[clamp(4rem,17vw,13rem)] leading-none text-roa-800">
            ROA BREW
          </p>
        </div>
      </div>

      <div className="relative border-t-2 border-cream/10 bg-roa-950">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-5 text-sm text-cream/45 sm:flex-row">
          <div className="text-center sm:text-left">
            <p>
              {/* La razón social suele acabar en punto (E.I.R.L.), así que no
                  se le agrega otro. */}
              © {year} {settings.legalName.replace(/\.$/, "")}. Todos los derechos
              reservados.
            </p>
            <p className="mt-0.5 text-cream/35">RUC {settings.ruc}</p>
          </div>
          <p className="flex items-center gap-2">
            <KodaMark className="h-5 w-5 text-roa-400" />
            Hecho con matcha y mucho café frío.
          </p>
        </div>
      </div>
    </footer>
  );
}
