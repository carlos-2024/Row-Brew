"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Logo from "@/components/Logo";
import {
  ChartIcon,
  ReceiptIcon,
  BobaIcon,
  FolderIcon,
  TagIcon,
  GearIcon,
  ExternalIcon,
  PowerIcon,
  PawIcon,
  EyeIcon,
  HandshakeIcon,
  CalendarIcon,
  SlidersIcon,
  PartyIcon,
  TicketIcon,
} from "@/components/Icons";

const LINKS = [
  { href: "/admin", label: "Resumen", Icon: ChartIcon, exact: true },
  { href: "/admin/visitas", label: "Visitas", Icon: EyeIcon },
  { href: "/admin/pedidos", label: "Pedidos", Icon: ReceiptIcon },
  { href: "/admin/eventos", label: "Eventos", Icon: CalendarIcon },
  // exact: sin esto se marcaría también al estar en /admin/eventos, que
  // empieza igual pero es otra cosa (las cotizaciones)
  { href: "/admin/evento", label: "Modo evento", Icon: PartyIcon, exact: true },
  { href: "/admin/productos", label: "Productos", Icon: BobaIcon },
  { href: "/admin/categorias", label: "Categorías", Icon: FolderIcon },
  { href: "/admin/extras", label: "Opcionales", Icon: SlidersIcon },
  { href: "/admin/promos", label: "Promos", Icon: TagIcon },
  { href: "/admin/descuentos", label: "Descuentos", Icon: TicketIcon },
  { href: "/admin/aliados", label: "Aliados", Icon: HandshakeIcon },
  { href: "/admin/fidelidad", label: "Fidelidad", Icon: PawIcon },
  { href: "/admin/ajustes", label: "Ajustes", Icon: GearIcon },
];

export default function AdminNav({
  userName,
  pendingCount,
}: {
  userName: string;
  pendingCount: number;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <>
      {/* Barra móvil */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b-2 border-cream/10 bg-roa-900 px-4 py-3 lg:hidden">
        <Logo className="text-[18px]" tone="cream" />
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-full border-2 border-cream/25 px-4 py-2 text-sm font-bold text-cream"
        >
          {open ? "Cerrar" : "Menú"}
        </button>
      </div>

      {/*
        En pantallas anchas es una columna del alto de la ventana: el logo
        arriba y la salida abajo se quedan quietos, y solo la lista de
        secciones se desplaza. Antes tenía ese alto pero sin desbordamiento,
        así que en una laptop los últimos enlaces —"Ver el sitio" y "Cerrar
        sesión"— caían fuera y no había forma de llegar a ellos.

        En el teléfono se queda como estaba, creciendo hacia abajo: el menú
        empieza debajo de la barra superior, y recortarlo al alto de la
        pantalla le comía justo esos 66 píxeles por el otro extremo.
      */}
      <aside
        className={`${
          open ? "block" : "hidden"
        } sticky top-0 z-20 h-fit shrink-0 border-b-2 border-cream/10 bg-roa-900 p-4 lg:flex lg:h-dvh lg:flex-col lg:overflow-hidden lg:w-64 lg:border-b-0 lg:border-r-2 lg:p-6`}
      >
        <div className="hidden lg:block lg:shrink-0">
          <Link href="/" className="inline-block transition hover:-rotate-3">
            <Logo className="text-[24px]" tone="cream" />
          </Link>
          <p className="mt-3 font-hand text-xl text-roa-300">hola, {userName}</p>
        </div>

        {/* lg:min-h-0: sin él, un hijo de flex no se encoge por debajo de su
            contenido y el desbordamiento nunca llega a activarse.
            -mx-1 px-1: el hueco para que la barra de desplazamiento no se
            monte sobre el borde de los botones. */}
        <nav className="mt-4 space-y-1 lg:-mx-1 lg:mt-8 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:px-1">
          {LINKS.map((link) => {
            const active = isActive(link.href, link.exact);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 font-bold transition ${
                  active
                    ? "bg-roa-500 text-cream"
                    : "text-cream/60 hover:bg-roa-800 hover:text-cream"
                }`}
              >
                <link.Icon className="h-5 w-5 shrink-0" />
                <span className="flex-1">{link.label}</span>
                {link.href === "/admin/pedidos" && pendingCount > 0 && (
                  <span className="grid h-6 min-w-6 place-items-center rounded-full bg-berry px-1.5 text-xs text-cream">
                    {pendingCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 space-y-2 border-t-2 border-cream/10 pt-5 lg:shrink-0">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm text-cream/55 transition hover:bg-roa-800 hover:text-cream"
          >
            <ExternalIcon className="h-4.5 w-4.5" /> Ver el sitio
          </Link>
          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 rounded-xl px-4 py-2.5 text-left text-sm text-cream/55 transition hover:bg-berry/20 hover:text-berry"
            >
              <PowerIcon className="h-4.5 w-4.5" /> Cerrar sesión
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
