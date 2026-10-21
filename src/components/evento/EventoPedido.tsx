"use client";

import { useMemo, useState } from "react";
import ProductArt from "@/components/ProductArt";
import { CheckIcon, ReceiptIcon } from "@/components/Icons";
import type { EventoProducto } from "@/lib/evento";

const BADGES: Record<string, { text: string; className: string }> = {
  nuevo: { text: "NUEVO", className: "bg-mango text-ink -rotate-6" },
  estrella: { text: "★ TOP", className: "bg-grape text-ink rotate-6" },
};

const INPUT =
  "w-full rounded-xl border-2 border-ink/15 bg-white px-4 py-3 text-ink outline-none transition placeholder:text-ink/30 focus:border-roa-500";

/**
 * La carta del evento, con pedido.
 *
 * Es un carrito propio y no el del local: el del local manda a WhatsApp con
 * dirección y envío, y en una feria el cliente está a dos metros de la barra.
 * Acá el pedido se registra y devuelve un número que cantar.
 *
 * Nada se guarda entre visitas a propósito. En una feria el teléfono pasa de
 * mano en mano y recuperar el carrito de otra persona confunde más de lo que
 * ayuda; además el pedido se arma y se envía en el mismo minuto.
 */
export default function EventoPedido({
  productos,
  currency,
  mostrarPrecio,
  permitePedir,
}: {
  productos: EventoProducto[];
  currency: string;
  mostrarPrecio: boolean;
  permitePedir: boolean;
}) {
  const [cantidades, setCantidades] = useState<Record<string, number>>({});
  const [abierto, setAbierto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listo, setListo] = useState<{ code: string } | null>(null);
  const [form, setForm] = useState({ customerName: "", phone: "", note: "" });

  const elegidos = useMemo(
    () =>
      productos
        .map((p) => ({ p, n: cantidades[p.id] ?? 0 }))
        .filter((x) => x.n > 0),
    [productos, cantidades]
  );

  const total = elegidos.reduce((s, { p, n }) => s + p.price * n, 0);
  const unidades = elegidos.reduce((s, x) => s + x.n, 0);

  const sumar = (id: string, delta: number) =>
    setCantidades((prev) => {
      const n = Math.max(0, Math.min(20, (prev[id] ?? 0) + delta));
      const copia = { ...prev };
      if (n === 0) delete copia[id];
      else copia[id] = n;
      return copia;
    });

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.customerName.trim().length < 2) {
      setError("Déjanos tu nombre para cantarte el pedido.");
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch("/api/evento/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          // Solo id y cantidad: el precio lo pone el servidor
          items: elegidos.map(({ p, n }) => ({ id: p.id, quantity: n })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "No pudimos registrar tu pedido.");

      setListo({ code: data.code });
      setCantidades({});
      setForm({ customerName: "", phone: "", note: "" });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  // ── Pedido registrado ──
  if (listo) {
    return (
      <div className="mt-8 rounded-3xl border-2 border-ink bg-mango p-8 text-center text-ink">
        <p className="flex items-center justify-center gap-2 font-display text-3xl leading-none">
          <CheckIcon className="h-7 w-7" />
          ¡Listo!
        </p>
        <p className="mt-4 text-lg">Tu número es</p>
        <p className="font-display text-6xl leading-none">{listo.code}</p>
        <p className="mt-4 text-sm opacity-75">
          Acércate a la barra y dilo. Te avisamos apenas esté.
        </p>
        <button
          type="button"
          onClick={() => setListo(null)}
          className="mt-6 rounded-full border-2 border-ink px-6 py-3 font-display text-lg transition hover:bg-ink hover:text-cream"
        >
          Pedir algo más
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {productos.map((p) => {
          const n = cantidades[p.id] ?? 0;
          const badge = p.badge ? BADGES[p.badge] : null;

          return (
            <article
              key={p.id}
              className="flex h-full flex-col overflow-hidden rounded-3xl border-2 border-ink bg-cream text-ink shadow-[5px_5px_0_var(--color-ink)]"
            >
              <div className="relative grid place-items-center bg-gradient-to-b from-roa-200 to-roa-100 py-6">
                {badge && (
                  <span
                    className={`absolute left-3 top-3 rounded-full border-2 border-ink px-3 py-1 text-[11px] font-black tracking-wide ${badge.className}`}
                  >
                    {badge.text}
                  </span>
                )}
                {p.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="h-40 w-auto object-contain"
                    loading="lazy"
                  />
                ) : (
                  <ProductArt
                    name={p.name}
                    categorySlug={p.categorySlug}
                    kind={p.kind}
                    temperature={p.temperature}
                    className="h-40"
                  />
                )}
              </div>

              <div className="flex flex-1 flex-col p-4">
                <h3 className="font-display text-xl leading-tight">{p.name}</h3>
                {p.description && (
                  <p className="mt-1.5 text-sm leading-snug text-ink/60">
                    {p.description}
                  </p>
                )}

                <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                  {mostrarPrecio ? (
                    <p className="font-display text-2xl leading-none">
                      {currency} {p.price.toFixed(2)}
                    </p>
                  ) : (
                    <span />
                  )}

                  {permitePedir &&
                    (n === 0 ? (
                      <button
                        type="button"
                        onClick={() => sumar(p.id, 1)}
                        className="rounded-full border-2 border-ink bg-mango px-5 py-2 font-display text-lg text-ink transition hover:-translate-y-0.5"
                      >
                        Pedir
                      </button>
                    ) : (
                      <span className="flex items-center gap-2 rounded-full border-2 border-ink bg-mango px-2 py-1 text-ink">
                        <button
                          type="button"
                          onClick={() => sumar(p.id, -1)}
                          aria-label={`Quitar un ${p.name}`}
                          className="grid h-7 w-7 place-items-center font-display text-xl leading-none"
                        >
                          −
                        </button>
                        <span className="min-w-5 text-center font-display text-lg">
                          {n}
                        </span>
                        <button
                          type="button"
                          onClick={() => sumar(p.id, 1)}
                          aria-label={`Agregar un ${p.name}`}
                          className="grid h-7 w-7 place-items-center font-display text-xl leading-none"
                        >
                          +
                        </button>
                      </span>
                    ))}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* ── Barra fija con el pedido en curso ── */}
      {permitePedir && unidades > 0 && !abierto && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t-2 border-ink bg-cream px-5 py-4">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
            <p className="font-display text-xl leading-none text-ink">
              {unidades} {unidades === 1 ? "producto" : "productos"}
              {mostrarPrecio && (
                <span className="ml-2 text-ink/55">
                  {currency} {total.toFixed(2)}
                </span>
              )}
            </p>
            <button
              type="button"
              onClick={() => setAbierto(true)}
              className="flex items-center gap-2 rounded-full border-2 border-ink bg-mango px-7 py-3 font-display text-xl text-ink shadow-[4px_4px_0_var(--color-ink)]"
            >
              <ReceiptIcon className="h-5 w-5" />
              Enviar
            </button>
          </div>
        </div>
      )}

      {/* ── Datos de quien pide ── */}
      {abierto && (
        <div className="fixed inset-0 z-[120] grid place-items-end bg-ink/60 sm:place-items-center">
          <form
            onSubmit={enviar}
            className="max-h-[90dvh] w-full overflow-y-auto rounded-t-3xl border-2 border-ink bg-cream p-6 sm:max-w-md sm:rounded-3xl"
          >
            <p className="font-display text-2xl leading-none text-ink">Tu pedido</p>

            <ul className="mt-4 space-y-1.5 border-b-2 border-ink/10 pb-4">
              {elegidos.map(({ p, n }) => (
                <li
                  key={p.id}
                  className="flex items-baseline justify-between gap-3 text-sm text-ink/75"
                >
                  <span>
                    {n}× {p.name}
                  </span>
                  {mostrarPrecio && (
                    <span className="font-bold">
                      {currency} {(p.price * n).toFixed(2)}
                    </span>
                  )}
                </li>
              ))}
            </ul>

            {mostrarPrecio && (
              <p className="mt-3 flex items-baseline justify-between font-display text-2xl text-ink">
                <span>Total</span>
                <span>
                  {currency} {total.toFixed(2)}
                </span>
              </p>
            )}

            <div className="mt-5 space-y-3">
              <input
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                placeholder="Tu nombre"
                className={INPUT}
                autoComplete="given-name"
              />
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Celular (opcional)"
                inputMode="tel"
                className={INPUT}
                autoComplete="tel"
              />
              <textarea
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                rows={2}
                placeholder="Sin azúcar, poco hielo… (opcional)"
                className={`${INPUT} resize-none`}
              />
            </div>

            {error && (
              <p className="mt-3 rounded-xl border-2 border-berry bg-berry/10 px-3 py-2 text-sm font-medium text-berry">
                {error}
              </p>
            )}

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setAbierto(false)}
                className="rounded-full border-2 border-ink px-5 py-3 font-display text-lg text-ink"
              >
                Volver
              </button>
              <button
                type="submit"
                disabled={enviando}
                className="flex-1 rounded-full border-2 border-ink bg-mango px-6 py-3 font-display text-xl text-ink shadow-[4px_4px_0_var(--color-ink)] disabled:opacity-50"
              >
                {enviando ? "Enviando…" : "Confirmar pedido"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
