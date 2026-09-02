"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Calendar from "./Calendar";
import { Sparkle } from "@/components/Leaf";
import { WhatsAppIcon } from "@/components/Icons";
import { formatEventDate, toUtcDate } from "@/lib/events";

type Props = {
  eventTypes: string[];
  whatsapp: string;
  /** Texto del botón que abre el popup */
  label?: string;
  className?: string;
};

const INPUT =
  "w-full rounded-xl border-2 border-ink/15 bg-white/70 px-4 py-3 text-ink outline-none transition placeholder:text-ink/30 focus:border-roa-500";

export default function EventQuoteModal({
  eventTypes,
  whatsapp,
  label = "Cotizar mi evento",
  className = "",
}: Props) {
  const [abierto, setAbierto] = useState(false);
  const [montado, setMontado] = useState(false);
  const [blocked, setBlocked] = useState<string[]>([]);

  // El portal necesita el document, que no existe al renderizar en el servidor
  useEffect(() => setMontado(true), []);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codigo, setCodigo] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    eventDate: "",
    eventType: eventTypes[0] ?? "",
    notes: "",
  });

  // Las fechas ocupadas se piden al abrir, no antes: así siempre están frescas
  useEffect(() => {
    if (!abierto) return;
    fetch("/api/eventos")
      .then((r) => r.json())
      .then((d) => setBlocked(d.blocked ?? []))
      .catch(() => setBlocked([]));
  }, [abierto]);

  useEffect(() => {
    document.body.style.overflow = abierto ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [abierto]);

  function cerrar() {
    setAbierto(false);
    setError(null);
    if (codigo) {
      // Al cerrar tras un envío exitoso se limpia para la próxima
      setCodigo(null);
      setForm({
        name: "",
        email: "",
        phone: "",
        eventDate: "",
        eventType: eventTypes[0] ?? "",
        notes: "",
      });
    }
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.eventDate) {
      setError("Elige la fecha de tu evento en el calendario.");
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch("/api/eventos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "No pudimos enviar tu solicitud.");
      setCodigo(data.code);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setEnviando(false);
    }
  }

  const fechaLarga = form.eventDate
    ? formatEventDate(toUtcDate(form.eventDate)!)
    : null;

  const waTexto = codigo
    ? `¡Hola Roa Brew! Envié una solicitud de cotización para mi evento.\nCódigo: ${codigo}\nNombre: ${form.name}\nFecha: ${fechaLarga}\nTipo: ${form.eventType}`
    : "";

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className={className}
      >
        {label} <span aria-hidden>→</span>
      </button>

      {/* El popup se monta en el body con un portal. Si se renderizara donde
          está el botón, cualquier ancestro con transform, filter o will-change
          —como el envoltorio de animación de las tarjetas— lo atraparía dentro
          y dejaría de cubrir la pantalla. */}
      {abierto &&
        montado &&
        createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-roa-950/85 p-4 backdrop-blur-sm sm:items-center"
          onClick={cerrar}
          role="dialog"
          aria-modal="true"
          aria-label="Cotizar mi evento"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="my-auto w-full max-w-3xl animate-[pop-in_0.4s_cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden rounded-[2rem] border-2 border-ink bg-cream text-ink shadow-[8px_8px_0_var(--color-ink)]"
          >
            {/* Cabecera */}
            <div className="flex items-start justify-between gap-4 border-b-2 border-ink/10 bg-roa-500 px-6 py-5 text-cream">
              <div>
                <p className="font-hand text-2xl leading-none text-roa-100">
                  cuéntanos de tu evento
                </p>
                <h3 className="mt-1 font-display text-3xl">Cotiza con nosotros</h3>
              </div>
              <button
                onClick={cerrar}
                aria-label="Cerrar"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-cream text-xl transition hover:rotate-90 hover:bg-cream hover:text-roa-700"
              >
                ✕
              </button>
            </div>

            {codigo ? (
              /* ── Confirmación ── */
              <div className="px-6 py-10 text-center">
                <Sparkle className="mx-auto h-10 w-10 animate-spin-slow text-mango" />
                <p className="mt-4 font-hand text-3xl text-roa-500">¡solicitud enviada!</p>
                <h4 className="mt-1 font-display text-3xl">
                  Te escribimos pronto
                </h4>
                <p className="mx-auto mt-4 max-w-md text-ink/60">
                  Guardamos tu solicitud con el código{" "}
                  <strong className="text-roa-700">{codigo}</strong>. Nuestro equipo
                  revisa la fecha y te manda la cotización por WhatsApp.
                </p>

                <div className="mt-7 flex flex-wrap justify-center gap-3">
                  <a
                    href={`https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(waTexto)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-shine inline-flex items-center gap-2 rounded-full border-2 border-ink bg-[#25D366] px-6 py-3.5 font-bold text-ink shadow-[4px_4px_0_var(--color-ink)] transition hover:-translate-y-0.5"
                  >
                    <WhatsAppIcon className="h-5 w-5" />
                    Adelantar por WhatsApp
                  </a>
                  <button
                    onClick={cerrar}
                    className="rounded-full border-2 border-ink px-6 py-3.5 font-bold transition hover:bg-ink hover:text-cream"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            ) : (
              /* ── Formulario ── */
              <form onSubmit={enviar} className="grid gap-6 p-6 sm:p-7 lg:grid-cols-2">
                <div className="space-y-4">
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-bold text-roa-700">
                      Nombres completos
                    </span>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Nombre y apellido"
                      className={INPUT}
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-sm font-bold text-roa-700">
                      Correo
                    </span>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="tucorreo@ejemplo.com"
                      className={INPUT}
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-sm font-bold text-roa-700">
                      Número de WhatsApp
                    </span>
                    <input
                      required
                      inputMode="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="999 999 999"
                      className={INPUT}
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-sm font-bold text-roa-700">
                      Tipo de evento
                    </span>
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
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-sm font-bold text-roa-700">
                      Cuéntanos más{" "}
                      <span className="font-normal text-ink/40">(opcional)</span>
                    </span>
                    <textarea
                      rows={2}
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      placeholder="Cuántas personas, lugar, horario…"
                      className={`${INPUT} resize-none`}
                    />
                  </label>
                </div>

                <div>
                  <span className="mb-1.5 block text-sm font-bold text-roa-700">
                    Fecha del evento
                  </span>
                  <Calendar
                    blocked={blocked}
                    value={form.eventDate}
                    onSelect={(iso) => setForm({ ...form, eventDate: iso })}
                  />

                  <p className="mt-2 flex items-center gap-2 text-xs text-ink/45">
                    <span className="inline-block h-3 w-3 rounded bg-berry/25" />
                    Días no disponibles
                  </p>

                  {fechaLarga && (
                    <p className="mt-3 rounded-xl border-2 border-roa-500 bg-roa-100 px-4 py-2.5 text-sm font-bold capitalize text-roa-700">
                      {fechaLarga}
                    </p>
                  )}

                  {error && (
                    <p className="mt-3 rounded-xl border-2 border-berry bg-berry/10 px-4 py-2.5 text-sm font-medium text-berry">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={enviando}
                    className="btn-shine mt-4 w-full rounded-full border-2 border-ink bg-mango py-4 font-display text-xl text-ink shadow-[5px_5px_0_var(--color-ink)] transition hover:-translate-y-0.5 disabled:opacity-60"
                  >
                    {enviando ? "Enviando…" : "Enviar solicitud"}
                  </button>

                  <p className="mt-2 text-center text-[11px] text-ink/40">
                    Te respondemos con la cotización por WhatsApp.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>,
          document.body
        )}
    </>
  );
}
