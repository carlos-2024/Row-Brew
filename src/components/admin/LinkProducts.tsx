"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ProductArt from "@/components/ProductArt";
import { SearchIcon } from "@/components/Icons";
import { linkExtraGroupProducts } from "@/app/admin/actions";

export type ProductoVinculable = {
  id: string;
  name: string;
  price: number;
  active: boolean;
  categoryName: string;
  categorySlug: string;
  categoryKind: string;
};

/**
 * Elige a qué productos se ofrece un grupo de opcionales.
 *
 * Va en un panel aparte y no en una lista siempre visible porque la carta
 * pasa de cuarenta productos: en línea empujaba el resto del formulario fuera
 * de la pantalla y obligaba a buscar a ojo entre todos.
 *
 * Lo que se marca dentro del panel es un borrador: hasta tocar Confirmar no
 * cambia nada, así cerrarlo por error no deshace los vínculos ya guardados.
 */
export default function LinkProducts({
  grupoId,
  grupoNombre,
  productos,
  vinculados,
  currency,
}: {
  grupoId: string;
  grupoNombre: string;
  productos: ProductoVinculable[];
  vinculados: string[];
  currency: string;
}) {
  const [guardados, setGuardados] = useState<string[]>(vinculados);
  const [abierto, setAbierto] = useState(false);
  const [borrador, setBorrador] = useState<Set<string>>(new Set(vinculados));
  const [busqueda, setBusqueda] = useState("");
  const [montado, setMontado] = useState(false);
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => setMontado(true), []);

  useEffect(() => {
    document.body.style.overflow = abierto ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [abierto]);

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return productos;
    return productos.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.categoryName.toLowerCase().includes(q)
    );
  }, [productos, busqueda]);

  const porCategoria = useMemo(() => {
    const mapa = new Map<string, ProductoVinculable[]>();
    for (const p of visibles) {
      const lista = mapa.get(p.categoryName) ?? [];
      lista.push(p);
      mapa.set(p.categoryName, lista);
    }
    return [...mapa.entries()];
  }, [visibles]);

  function abrir() {
    setBorrador(new Set(guardados));
    setBusqueda("");
    setAbierto(true);
  }

  function alternar(id: string) {
    setBorrador((prev) => {
      const copia = new Set(prev);
      if (copia.has(id)) copia.delete(id);
      else copia.add(id);
      return copia;
    });
  }

  /** Marca o desmarca de golpe lo que se está viendo. */
  function todosLosVisibles(marcar: boolean) {
    setBorrador((prev) => {
      const copia = new Set(prev);
      for (const p of visibles) {
        if (marcar) copia.add(p.id);
        else copia.delete(p.id);
      }
      return copia;
    });
  }

  function confirmar() {
    setGuardados([...borrador]);
    setAbierto(false);
    // El estado se aplica antes de enviar; sin el salto de turno el formulario
    // viajaría con los ids anteriores
    window.setTimeout(() => form.current?.requestSubmit(), 0);
  }

  const nombres = guardados
    .map((id) => productos.find((p) => p.id === id)?.name)
    .filter(Boolean);

  return (
    <>
      <form ref={form} action={linkExtraGroupProducts}>
        <input type="hidden" name="id" value={grupoId} />
        {guardados.map((id) => (
          <input key={id} type="hidden" name="productIds" value={id} />
        ))}
      </form>

      <div className="mt-5 border-t-2 border-cream/8 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-wider text-cream/40">
            Productos que lo ofrecen ({guardados.length})
          </p>
          <button
            type="button"
            onClick={abrir}
            className="rounded-full border-2 border-roa-500 px-4 py-2 text-sm font-bold text-roa-300 transition hover:bg-roa-500 hover:text-cream"
          >
            Vincular productos
          </button>
        </div>

        <p className="mt-2 text-sm leading-snug text-cream/45">
          {nombres.length === 0
            ? "Ninguno todavía: este grupo no se le ofrece a nadie."
            : nombres.slice(0, 6).join(", ") +
              (nombres.length > 6 ? ` y ${nombres.length - 6} más` : "")}
        </p>
      </div>

      {abierto &&
        montado &&
        createPortal(
          <div
            className="fixed inset-0 z-[150] flex justify-end bg-roa-950/80 backdrop-blur-sm"
            onClick={() => setAbierto(false)}
            role="dialog"
            aria-modal="true"
            aria-label={`Seleccionar productos para ${grupoNombre}`}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex h-dvh w-full max-w-md flex-col border-l-2 border-cream/15 bg-roa-900 text-cream"
            >
              {/* Cabecera */}
              <div className="flex items-center gap-3 border-b-2 border-cream/10 px-5 py-4">
                <button
                  type="button"
                  onClick={() => setAbierto(false)}
                  aria-label="Cerrar sin guardar"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-cream/25 text-lg transition hover:bg-cream/10"
                >
                  ←
                </button>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-xl leading-none">
                    Seleccionar productos ({borrador.size})
                  </p>
                  <p className="mt-1 truncate text-xs text-cream/45">{grupoNombre}</p>
                </div>
              </div>

              {/* Buscador */}
              <div className="border-b-2 border-cream/10 px-5 py-3">
                <div className="relative">
                  <input
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar producto o familia…"
                    className="w-full rounded-xl border-2 border-cream/15 bg-roa-950 py-2.5 pl-10 pr-3 text-sm outline-none transition placeholder:text-cream/25 focus:border-roa-500"
                  />
                  <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cream/30" />
                </div>

                <div className="mt-2 flex gap-4 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => todosLosVisibles(true)}
                    className="text-roa-300 underline underline-offset-2"
                  >
                    Marcar {busqueda ? "lo visible" : "todos"}
                  </button>
                  <button
                    type="button"
                    onClick={() => todosLosVisibles(false)}
                    className="text-cream/40 underline underline-offset-2"
                  >
                    Desmarcar
                  </button>
                </div>
              </div>

              {/* Lista */}
              <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2">
                {porCategoria.length === 0 && (
                  <p className="px-2 py-6 text-center text-sm text-cream/40">
                    Ningún producto coincide con “{busqueda}”.
                  </p>
                )}

                {porCategoria.map(([familia, items]) => (
                  <div key={familia} className="mb-3">
                    <p className="px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider text-cream/35">
                      {familia}
                    </p>

                    {items.map((p) => {
                      const on = borrador.has(p.id);
                      return (
                        <label
                          key={p.id}
                          className={`flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 transition ${
                            on ? "bg-roa-500/20" : "hover:bg-cream/6"
                          }`}
                        >
                          <span className="grid h-12 w-10 shrink-0 place-items-center rounded-lg bg-cream/10">
                            <ProductArt
                              name={p.name}
                              categorySlug={p.categorySlug}
                              kind={p.categoryKind}
                              className="h-10"
                              animated={false}
                            />
                          </span>

                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm">
                              {p.name}
                              {!p.active && (
                                <span className="ml-1.5 text-[10px] text-cream/35">
                                  fuera de la carta
                                </span>
                              )}
                            </span>
                            <span className="text-xs text-cream/40">
                              {currency} {p.price.toFixed(2)}
                            </span>
                          </span>

                          <input
                            type="checkbox"
                            checked={on}
                            onChange={() => alternar(p.id)}
                            className="h-5 w-5 shrink-0 accent-roa-500"
                          />
                        </label>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Confirmar */}
              <div className="border-t-2 border-cream/10 px-5 py-4">
                <button
                  type="button"
                  onClick={confirmar}
                  className="w-full rounded-full border-2 border-ink bg-mango py-3.5 font-display text-lg text-ink transition hover:brightness-95"
                >
                  Confirmar ({borrador.size})
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
