"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import { BobaIcon } from "@/components/Icons";
import { useCart } from "@/components/cart/CartProvider";

const NAV = [
  { href: "/carta", label: "Carta" },
  { href: "/#promos", label: "Promos" },
  { href: "/fidelidad", label: "Fidelidad" },
  { href: "/#delivery", label: "Delivery" },
  { href: "/#experiencia", label: "Experiencia" },
  { href: "/#contacto", label: "Contacto" },
];

export default function Header({ whatsapp }: { whatsapp: string }) {
  const { count, setOpen, lastAdded } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const logoRef = useRef<HTMLImageElement>(null);
  const pathname = usePathname();

  // Si el PNG falla antes de que React hidrate, el onError nunca llega:
  // por eso al montar se revisa el estado real del elemento.
  useEffect(() => {
    const img = logoRef.current;
    if (img?.complete && img.naturalWidth === 0) setLogoFailed(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${
        scrolled
          ? "border-b-2 border-ink/10 bg-roa-950/92 py-2 backdrop-blur-lg"
          : "border-b-2 border-transparent py-4"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5">
        {/* El sello vertical cuelga del borde superior, como en los posters */}
        <Link
          href="/"
          aria-label="Roa Brew — inicio"
          className={`group relative z-10 h-11 shrink-0 transition-all duration-500 ${
            logoFailed ? "w-auto" : scrolled ? "w-16" : "w-[5.4rem] sm:w-[6.8rem]"
          }`}
        >
          {logoFailed ? (
            <div className="transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105">
              <Logo className="text-[22px]" tone="cream" />
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={logoRef}
              src="/img/logoheader.png"
              alt="Roa Brew"
              onError={() => setLogoFailed(true)}
              className={`absolute left-0 w-auto origin-top drop-shadow-[0_8px_18px_rgba(0,0,0,0.28)] transition-all duration-500 group-hover:scale-[1.03] ${
                scrolled ? "-top-2 h-24" : "-top-4 h-32 sm:h-40"
              }`}
            />
          )}
        </Link>

        {/* Nav escritorio */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative px-4 py-2 text-sm font-semibold text-cream/80 transition hover:text-cream"
            >
              {item.label}
              <span className="absolute inset-x-3 bottom-1 h-[2px] origin-left scale-x-0 rounded-full bg-grape transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-full border-2 border-cream/25 px-4 py-2 text-sm font-bold text-cream transition hover:border-cream hover:bg-cream hover:text-roa-800 sm:block"
          >
            WhatsApp
          </a>

          <button
            onClick={() => setOpen(true)}
            aria-label={`Abrir carrito, ${count} productos`}
            className={`relative grid h-11 w-11 place-items-center rounded-full border-2 border-ink bg-roa-400 text-ink transition hover:bg-grape ${
              lastAdded ? "animate-[pop-in_0.5s_cubic-bezier(0.34,1.56,0.64,1)]" : ""
            }`}
          >
            <BobaIcon className="h-6 w-6" />
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid h-6 min-w-6 place-items-center rounded-full border-2 border-roa-950 bg-berry px-1 text-xs font-bold text-cream tabular-nums">
                {count}
              </span>
            )}
          </button>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Abrir menú"
            aria-expanded={menuOpen}
            className="grid h-11 w-11 place-items-center rounded-full border-2 border-cream/25 text-cream transition hover:bg-cream/10 md:hidden"
          >
            <span className="relative block h-4 w-5">
              <span
                className={`absolute left-0 h-[2px] w-5 rounded bg-current transition-all ${
                  menuOpen ? "top-1.5 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 top-1.5 h-[2px] w-5 rounded bg-current transition-opacity ${
                  menuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`absolute left-0 h-[2px] w-5 rounded bg-current transition-all ${
                  menuOpen ? "top-1.5 -rotate-45" : "top-3"
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Nav móvil */}
      <nav
        className={`overflow-hidden transition-[max-height,opacity] duration-400 md:hidden ${
          menuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <ul className="mx-5 mt-3 space-y-1 rounded-3xl border-2 border-cream/12 bg-roa-900/95 p-3 backdrop-blur">
          {NAV.map((item, i) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block rounded-2xl px-4 py-3 font-display text-2xl text-cream transition hover:bg-roa-700"
                style={{ transitionDelay: `${i * 30}ms` }}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
