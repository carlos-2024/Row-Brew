"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart, unitPrice } from "./CartProvider";
import AddressSearch, { type Direccion } from "./AddressSearch";
import CupArt from "@/components/CupArt";
import Calendar from "@/components/events/Calendar";
import {
  StoreIcon,
  ScooterIcon,
  PartyIcon,
  TrashIcon,
  WhatsAppIcon,
} from "@/components/Icons";
import { formatEventDate, toUtcDate } from "@/lib/events";

type Props = {
  whatsapp: string;
  currency: string;
  deliveryNote: string;
  eventTypes: string[];
};

type Step = "carrito" | "datos" | "enviando";

const ENTREGA = [
  { value: "recojo", label: "Recojo en el Pop Up", Icon: StoreIcon },
  { value: "delivery", label: "Delivery", Icon: ScooterIcon },
  { value: "evento", label: "Evento", Icon: PartyIcon },
];

const COMPROBANTES = [
  { value: "BOLETA", label: "Boleta simple", hint: "Sin datos adicionales" },
  { value: "BOLETA_DNI", label: "Boleta con DNI", hint: "Necesitamos tu DNI" },
  { value: "FACTURA", label: "Factura", hint: "RUC y razón social" },
];

const INPUT =
  "w-full rounded-xl border-2 border-ink/15 bg-white/70 px-4 py-3 text-ink outline-none transition placeholder:text-ink/30 focus:border-roa-500";

export default function CartDrawer({
  whatsapp,
  currency,
  deliveryNote,
  eventTypes,
}: Props) {
  const { items, count, pricing, open, setOpen, setQuantity, remove, clear } =
    useCart();
  const router = useRouter();

  const [step, setStep] = useState<Step>("carrito");
  const [error, setError] = useState<string | null>(null);
  const [direccion, setDireccion] = useState<Direccion | null>(null);
  const [blocked, setBlocked] = useState<string[]>([]);

  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    deliveryType: "recojo",
    scheduledFor: "",
    notes: "",
    docType: "BOLETA",
    docNumber: "",
    businessName: "",
    email: "",
    eventDate: "",
    eventType: eventTypes[0] ?? "",
  });

  const esDelivery = form.deliveryType === "delivery";
  const esEvento = form.deliveryType === "evento";

  // Las fechas ocupadas solo hacen falta si el pedido es para un evento
  useEffect(() => {
    if (!esEvento || blocked.length > 0) return;
    fetch("/api/eventos")
      .then((r) => r.json())
      .then((d) => setBlocked(d.blocked ?? []))
      .catch(() => setBlocked([]));
  }, [esEvento, blocked.length]);

  const envio = esDelivery ? (direccion?.fee ?? 0) : 0;
  const totalFinal = pricing.total + envio;

  const money = (n: number) => `${currency} ${n.toFixed(2)}`;

  function reiniciar() {
    setForm({
      customerName: "",
      phone: "",
      deliveryType: "recojo",
      scheduledFor: "",
      notes: "",
      docType: "BOLETA",
      docNumber: "",
      businessName: "",
      email: "",
      eventDate: "",
      eventType: eventTypes[0] ?? "",
    });
    setDireccion(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.customerName.trim() || form.phone.replace(/\D/g, "").length < 6) {
      setError("Necesitamos tu nombre y un número de contacto válido.");
      return;
    }
    if (esDelivery && !direccion) {
      setError("Indica tu dirección de entrega para calcular el envío.");
      return;
    }
    if (form.docType === "BOLETA_DNI" && form.docNumber.replace(/\D/g, "").length !== 8) {
      setError("El DNI debe tener 8 dígitos.");
      return;
    }
    if (form.docType === "FACTURA") {
      if (form.docNumber.replace(/\D/g, "").length !== 11) {
        setError("El RUC debe tener 11 dígitos.");
        return;
      }
      if (!form.businessName.trim()) {
        setError("Ingresa la razón social para la factura.");
        return;
      }
    }
    if (esEvento) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) {
        setError("Para eventos necesitamos un correo válido.");
        return;
      }
      if (!form.eventDate) {
        setError("Elige la fecha de tu evento.");
        return;
      }
    }

    setStep("enviando");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          address: direccion?.label ?? "",
          lat: direccion?.lat ?? undefined,
          lng: direccion?.lng ?? undefined,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            extras: i.extras,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "No pudimos registrar el pedido.");

      window.open(
        `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(data.message)}`,
        "_blank",
        "noopener"
      );

      clear();
      setOpen(false);
      setStep("carrito");
      reiniciar();
      router.push(`/pedido/${data.code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal. Intenta de nuevo.");
      setStep("datos");
    }
  }

  return (
    <>
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
            <form id="checkout-form" onSubmit={submit} className="space-y-5">
              <Campo label="¿Cómo te llamas?">
                <input
                  required
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  placeholder="Tu nombre"
                  className={INPUT}
                />
              </Campo>

              <Campo label="WhatsApp / celular">
                <input
                  required
                  inputMode="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="999 999 999"
                  className={INPUT}
                />
              </Campo>

              <Campo label="¿Cómo lo recibes?">
                <div className="grid grid-cols-3 gap-2">
                  {ENTREGA.map((opt) => (
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
              </Campo>

              {/* Delivery */}
              {esDelivery && (
                <Campo label="¿A dónde te lo llevamos?">
                  <AddressSearch
                    value={direccion}
                    onChange={setDireccion}
                    currency={currency}
                  />
                  <p className="mt-2 text-xs text-ink/45">{deliveryNote}</p>
                </Campo>
              )}

              {/* Evento */}
              {esEvento && (
                <div className="space-y-4 rounded-2xl border-2 border-grape bg-grape/10 p-4">
                  <p className="font-display text-lg leading-none text-ink">
                    Datos de tu evento
                  </p>

                  <Campo label="Correo">
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="tucorreo@ejemplo.com"
                      className={INPUT}
                    />
                  </Campo>

                  <Campo label="Tipo de evento">
                    <select
                      value={form.eventType}
                      onChange={(e) => setForm({ ...form, eventType: e.target.value })}
                      className={INPUT}
                    >
                      {eventTypes.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </Campo>

                  <Campo label="Fecha del evento">
                    <Calendar
                      blocked={blocked}
                      value={form.eventDate}
                      onSelect={(iso) => setForm({ ...form, eventDate: iso })}
                    />
                    {form.eventDate && (
                      <p className="mt-2 rounded-xl border-2 border-roa-500 bg-roa-100 px-3 py-2 text-xs font-bold capitalize text-roa-700">
                        {formatEventDate(toUtcDate(form.eventDate)!)}
                      </p>
                    )}
                  </Campo>
                </div>
              )}

              {/* Comprobante */}
              <Campo label="¿Qué comprobante necesitas?">
                <div className="space-y-2">
                  {COMPROBANTES.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          docType: c.value,
                          docNumber: "",
                          businessName: "",
                        })
                      }
                      className={`flex w-full items-center justify-between gap-3 rounded-xl border-2 px-4 py-3 text-left transition ${
                        form.docType === c.value
                          ? "border-ink bg-roa-500 text-cream"
                          : "border-ink/15 bg-white/60 hover:border-ink/40"
                      }`}
                    >
                      <span>
                        <span className="block text-sm font-bold">{c.label}</span>
                        <span
                          className={`text-xs ${
                            form.docType === c.value ? "text-cream/70" : "text-ink/45"
                          }`}
                        >
                          {c.hint}
                        </span>
                      </span>
                      <span
                        className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${
                          form.docType === c.value
                            ? "border-cream bg-cream text-roa-600"
                            : "border-ink/25"
                        }`}
                      >
                        {form.docType === c.value ? "✓" : ""}
                      </span>
                    </button>
                  ))}
                </div>
              </Campo>

              {form.docType === "BOLETA_DNI" && (
                <Campo label="Tu DNI">
                  <input
                    inputMode="numeric"
                    maxLength={8}
                    value={form.docNumber}
                    onChange={(e) => setForm({ ...form, docNumber: e.target.value })}
                    placeholder="12345678"
                    className={INPUT}
                  />
                </Campo>
              )}

              {form.docType === "FACTURA" && (
                <>
                  <Campo label="RUC">
                    <input
                      inputMode="numeric"
                      maxLength={11}
                      value={form.docNumber}
                      onChange={(e) => setForm({ ...form, docNumber: e.target.value })}
                      placeholder="20123456789"
                      className={INPUT}
                    />
                  </Campo>
                  <Campo label="Razón social">
                    <input
                      value={form.businessName}
                      onChange={(e) =>
                        setForm({ ...form, businessName: e.target.value })
                      }
                      placeholder="Mi Empresa S.A.C."
                      className={INPUT}
                    />
                  </Campo>
                </>
              )}

              {!esEvento && (
                <Campo label="¿Para cuándo? (opcional)">
                  <input
                    value={form.scheduledFor}
                    onChange={(e) => setForm({ ...form, scheduledFor: e.target.value })}
                    placeholder="Hoy 7pm / Sábado 4pm"
                    className={INPUT}
                  />
                </Campo>
              )}

              <Campo label="Notas (opcional)">
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Sin azúcar, leche sin lactosa, poco hielo…"
                  className={`${INPUT} resize-none`}
                />
              </Campo>

              {error && (
                <p className="rounded-xl border-2 border-berry bg-berry/10 px-3 py-2 text-sm font-medium text-berry">
                  {error}
                </p>
              )}
            </form>
          )}
        </div>

        {items.length > 0 && (
          <footer className="border-t-2 border-ink/12 bg-cream-2 px-5 py-4">
            {pricing.hints.map((h) => (
              <p
                key={h.id}
                className="mb-2 rounded-xl border-2 border-dashed border-roa-500 bg-roa-100 px-3 py-2 text-sm font-bold text-roa-700"
              >
                Agrega {h.missing} {h.missing === 1 ? "bebida" : "bebidas"} más de{" "}
                {h.title} y se te aplica el {h.label}
              </p>
            ))}

            {(pricing.applied.length > 0 || envio > 0) && (
              <div className="mb-3 space-y-1">
                <div className="flex items-baseline justify-between text-sm text-ink/55">
                  <span>Subtotal</span>
                  <span>{money(pricing.subtotal)}</span>
                </div>
                {pricing.applied.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-baseline justify-between text-sm font-bold text-roa-600"
                  >
                    <span>
                      {p.title} {p.label}
                      {p.bundles > 1 ? ` ×${p.bundles}` : ""}
                    </span>
                    <span>−{money(p.saved)}</span>
                  </div>
                ))}
                {envio > 0 && (
                  <div className="flex items-baseline justify-between text-sm font-bold text-ink/70">
                    <span>Envío</span>
                    <span>{money(envio)}</span>
                  </div>
                )}
              </div>
            )}

            <div className="mb-3 flex items-baseline justify-between">
              <span className="font-hand text-2xl text-roa-600">total</span>
              <span className="font-display text-3xl text-ink">{money(totalFinal)}</span>
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

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-roa-700">{label}</span>
      {children}
    </label>
  );
}
