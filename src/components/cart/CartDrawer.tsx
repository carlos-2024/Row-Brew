"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart, unitPrice } from "./CartProvider";
import CupArt from "@/components/CupArt";
import {
  StoreIcon,
  ScooterIcon,
  PartyIcon,
  TrashIcon,
  WhatsAppIcon,
} from "@/components/Icons";

type Props = {
  whatsapp: string;
  currency: string;
  deliveryNote: string;
};

type Step = "carrito" | "datos" | "enviando";

const DELIVERY_OPTIONS = [
  { value: "recojo", label: "Recojo en el Pop Up", Icon: StoreIcon },
  { value: "delivery", label: "Delivery", Icon: ScooterIcon },
  { value: "evento", label: "Evento", Icon: PartyIcon },
];

export default function CartDrawer({ whatsapp, currency, deliveryNote }: Props) {
  const { items, count, subtotal, open, setOpen, setQuantity, remove, clear } = useCart();
  const router = useRouter();

  const [step, setStep] = useState<Step>("carrito");
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    deliveryType: "recojo",
    address: "",
    scheduledFor: "",
    notes: "",
  });

  const money = (n: number) => `${currency} ${n.toFixed(2)}`;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.customerName.trim() || form.phone.replace(/\D/g, "").length < 6) {
      setError("Necesitamos tu nombre y un número de contacto válido.");
      return;
    }
    if (form.deliveryType === "delivery" && !form.address.trim()) {
      setError("Para delivery necesitamos la dirección.");
      return;
    }

    setStep("enviando");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            extras: i.extras,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "No pudimos registrar el pedido.");

      // Abrimos WhatsApp con el pedido ya escrito
      const wa = `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
        data.message
      )}`;
      window.open(wa, "_blank", "noopener");

      clear();
      setOpen(false);
      setStep("carrito");
      setForm({
        customerName: "",
        phone: "",
        deliveryType: "recojo",
        address: "",
        scheduledFor: "",
        notes: "",
      });
      router.push(`/pedido/${data.code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal. Intenta de nuevo.");
      setStep("datos");
    }
  }

  return (
    <>
      {/* Fondo */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-50 bg-roa-950/80 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Tu pedido"
        className={`fixed right-0 top-0 z-50 flex h-dvh w-full max-w-[27rem] flex-col border-l-2 border-ink bg-cream text-ink shadow-2xl transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Cabecera */}
        <header className="relative flex items-center justify-between gap-3 border-b-2 border-ink bg-roa-500 px-5 py-4 text-cream">
          <div>
            <p className="font-hand text-xl leading-none text-roa-100">tu pedido</p>
            <h2 className="font-display text-2xl">
              {count > 0 ? `${count} bebida${count > 1 ? "s" : ""}` : "Carrito vacío"}
            </h2>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Cerrar carrito"
            className="grid h-10 w-10 place-items-center rounded-full border-2 border-cream text-xl transition hover:rotate-90 hover:bg-cream hover:text-roa-700"
          >
            ✕
          </button>
        </header>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="animate-float">
                <CupArt name="Sparkling Mango Pop" categorySlug="sparkling-tea" className="h-40" />
              </div>
              <p className="mt-6 font-display text-2xl text-roa-700">Aún no eliges nada</p>
              <p className="mt-2 max-w-[16rem] text-sm text-ink/60">
                Arma tu combo: recuerda que hay promos 2x20 y 2x22 en la carta.
              </p>
              <button
                onClick={() => {
                  setOpen(false);
                  router.push("/carta");
                }}
                className="mt-6 rounded-full bg-ink px-6 py-3 font-bold text-cream transition hover:bg-roa-600"
              >
                Ver la carta
              </button>
            </div>
          ) : step === "carrito" ? (
            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={item.key}
                  className="flex gap-3 rounded-2xl border-2 border-ink/12 bg-white/70 p-3"
                >
                  <div className="grid h-20 w-14 shrink-0 place-items-center rounded-xl bg-roa-100">
                    <CupArt
                      name={item.name}
                      categorySlug={item.categorySlug}
                      className="h-16"
                      animated={false}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold leading-tight">{item.name}</p>
                    {item.extras.length > 0 && (
                      <p className="mt-0.5 text-xs text-roa-600">
                        + {item.extras.map((e) => e.name).join(", ")}
                      </p>
                    )}
                    <p className="mt-1 text-sm text-ink/55">{money(unitPrice(item))} c/u</p>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-1 rounded-full border-2 border-ink/15 bg-cream">
                        <button
                          onClick={() => setQuantity(item.key, item.quantity - 1)}
                          aria-label="Quitar uno"
                          className="grid h-7 w-7 place-items-center rounded-full text-lg transition hover:bg-ink hover:text-cream"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-sm font-bold tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => setQuantity(item.key, item.quantity + 1)}
                          aria-label="Agregar uno"
                          className="grid h-7 w-7 place-items-center rounded-full text-lg transition hover:bg-ink hover:text-cream"
                        >
                          +
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-display text-lg text-roa-700">
                          {money(unitPrice(item) * item.quantity)}
                        </span>
                        <button
                          onClick={() => remove(item.key)}
                          aria-label={`Eliminar ${item.name}`}
                          className="text-ink/35 transition hover:text-berry"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            /* ── Paso 2: datos ── */
            <form id="checkout-form" onSubmit={submit} className="space-y-4">
              <Field label="¿Cómo te llamas?">
                <input
                  required
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  placeholder="Tu nombre"
                  className={INPUT}
                />
              </Field>

              <Field label="WhatsApp / celular">
                <input
                  required
                  inputMode="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="999 999 999"
                  className={INPUT}
                />
              </Field>

              <Field label="¿Cómo lo recibes?">
                <div className="grid grid-cols-3 gap-2">
                  {DELIVERY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm({ ...form, deliveryType: opt.value })}
                      className={`rounded-xl border-2 px-2 py-3 text-center text-xs font-bold transition ${
                        form.deliveryType === opt.value
                          ? "border-ink bg-roa-500 text-cream"
                          : "border-ink/15 bg-white/60 hover:border-ink/40"
                      }`}
                    >
                      <opt.Icon className="mx-auto mb-1 h-6 w-6" />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </Field>

              {form.deliveryType === "delivery" && (
                <Field label="Dirección">
                  <input
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Av. ... , Los Olivos"
                    className={INPUT}
                  />
                  <p className="mt-1 text-xs text-ink/50">{deliveryNote}</p>
                </Field>
              )}

              <Field label="¿Para cuándo? (opcional)">
                <input
                  value={form.scheduledFor}
                  onChange={(e) => setForm({ ...form, scheduledFor: e.target.value })}
                  placeholder="Hoy 7pm / Sábado 4pm"
                  className={INPUT}
                />
              </Field>

              <Field label="Notas (opcional)">
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Sin azúcar, leche sin lactosa, poco hielo…"
                  className={`${INPUT} resize-none`}
                />
              </Field>

              {error && (
                <p className="rounded-xl border-2 border-berry bg-berry/10 px-3 py-2 text-sm font-medium text-berry">
                  {error}
                </p>
              )}
            </form>
          )}
        </div>

        {/* Pie */}
        {items.length > 0 && (
          <footer className="border-t-2 border-ink/12 bg-cream-2 px-5 py-4">
            <div className="mb-3 flex items-baseline justify-between">
              <span className="font-hand text-2xl text-roa-600">total</span>
              <span className="font-display text-3xl text-ink">{money(subtotal)}</span>
            </div>

            {step === "carrito" ? (
              <button
                onClick={() => setStep("datos")}
                className="btn-shine w-full rounded-full border-2 border-ink bg-roa-500 py-4 font-display text-xl text-cream transition hover:bg-roa-600"
              >
                Continuar
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep("carrito")}
                  disabled={step === "enviando"}
                  className="rounded-full border-2 border-ink px-5 py-4 font-bold transition hover:bg-ink hover:text-cream disabled:opacity-40"
                >
                  ←
                </button>
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={step === "enviando"}
                  className="btn-shine flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-ink bg-[#25D366] py-4 font-display text-xl text-ink transition hover:brightness-95 disabled:opacity-60"
                >
                  {step === "enviando" ? (
                    "Enviando…"
                  ) : (
                    <>
                      <WhatsAppIcon className="h-6 w-6" /> Pedir por WhatsApp
                    </>
                  )}
                </button>
              </div>
            )}

            <p className="mt-2 text-center text-[11px] text-ink/45">
              Confirmamos disponibilidad y pago por WhatsApp.
            </p>
          </footer>
        )}
      </aside>
    </>
  );
}

const INPUT =
  "w-full rounded-xl border-2 border-ink/15 bg-white/70 px-4 py-3 text-ink outline-none transition placeholder:text-ink/30 focus:border-roa-500 focus:bg-white";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-roa-700">{label}</span>
      {children}
    </label>
  );
}
