"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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

  /**
   * Con el menú abierto, la página de atrás se queda quieta.
   *
   * Sin esto el dedo arrastraba el contenido que hay detrás del menú: se veía
   * la pantalla moviéndose sola mientras uno creía estar recorriendo las
   * secciones.
   */
  useEffect(() => {
    if (!open) return;
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = antes;
    };
  }, [open]);

  /**
   * Al ensanchar la ventana el menú de escritorio aparece solo, así que el
   * del teléfono sobra. Si quedara abierto, el bloqueo de arriba dejaría la
   * página sin poder desplazarse y sin nada visible que lo explique.
   */
  useEffect(() => {
    const anchas = window.matchMedia("(min-width: 1024px)");
    const cerrar = () => anchas.matches && setOpen(false);
    anchas.addEventListener("change", cerrar);
    return () => anchas.removeEventListener("change", cerrar);
  }, []);

  return (
    <>
      {/*
        Con el menú abierto en el teléfono, la barra y el menú pasan a cubrir
        la pantalla como una sola columna. Así el menú ocupa exactamente lo
        que queda bajo la barra sin tener que restar su altura a mano —el
        intento anterior se comía los últimos enlaces por ese cálculo.

        `contents` hace que esta envoltura desaparezca cuando no hace falta:
        con el menú cerrado y en pantallas anchas, la barra y el menú vuelven
        a ser hijos directos del layout, que es lo que espera su rejilla.
      */}
      <div
        className={`${
          open ? "fixed inset-0 z-40 flex flex-col" : "contents"
        } lg:contents`}
      >
        {/* Barra móvil */}
        <div className="sticky top-0 z-30 flex shrink-0 items-center justify-between border-b-2 border-cream/10 bg-roa-900 px-4 py-3 lg:hidden">
          <Logo className="text-[18px]" tone="cream" />
          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-full border-2 border-cream/25 px-4 py-2 text-sm font-bold text-cream"
          >
            {open ? "Cerrar" : "Menú"}
          </button>
        </div>

        {/*
          Una columna del alto disponible, en el teléfono y en el escritorio:
          el logo arriba y la salida abajo se quedan quietos, y solo la lista
          de secciones se desplaza.

          flex-1 min-h-0: en el teléfono toma lo que queda bajo la barra; sin
          min-h-0 un hijo de flex no se encoge por debajo de su contenido y el
          desbordamiento nunca llegaría a activarse.
        */}
        <aside
          className={`${
            open ? "flex" : "hidden"
          } min-h-0 flex-1 flex-col overflow-hidden border-b-2 border-cream/10 bg-roa-900 p-4 lg:flex lg:h-dvh lg:w-64 lg:flex-none lg:border-b-0 lg:border-r-2 lg:p-6`}
        >
          <div className="hidden lg:block lg:shrink-0">
          <Link href="/" className="inline-block transition hover:-rotate-3">
            <Logo className="text-[24px]" tone="cream" />
          </Link>
          <p className="mt-3 font-hand text-xl text-roa-300">hola, {userName}</p>
        </div>

          {/* -mx-1 px-1: el hueco para que la barra de desplazamiento no se
              monte sobre el borde de los botones. */}
          <nav className="-mx-1 mt-4 min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-1 lg:mt-8">
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

          <div className="mt-6 shrink-0 space-y-2 border-t-2 border-cream/10 pt-5">
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
      </div>
    </>
  );
}
