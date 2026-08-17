"use client";

import { useState } from "react";
import StampCard from "./StampCard";
import { SearchIcon } from "@/components/Icons";
import type { LoyaltyStatus } from "@/lib/loyalty";

type CardData = {
  name: string;
  dni: string;
  status: LoyaltyStatus;
  message: string;
  created?: boolean;
};

type View = "buscar" | "registrar" | "tarjeta";

export default function LoyaltyLookup() {
  const [view, setView] = useState<View>("buscar");
  const [dni, setDni] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthday, setBirthday] = useState("");
  const [card, setCard] = useState<CardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function buscar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/fidelidad?dni=${encodeURIComponent(dni)}`);
      const data = await res.json();

      if (res.status === 404) {
        // No existe: se ofrece crearla en el momento
        setError(null);
        setView("registrar");
        return;
      }
      if (!res.ok) throw new Error(data?.error ?? "No pudimos consultar tu tarjeta.");

      setCard(data);
      setView("tarjeta");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setLoading(false);
    }
  }

  async function registrar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/fidelidad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dni, name, phone, birthday }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "No pudimos crear tu tarjeta.");

      setCard(data);
      setView("tarjeta");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setLoading(false);
    }
  }

  function reiniciar() {
    setCard(null);
    setDni("");
    setName("");
    setPhone("");
    setBirthday("");
    setError(null);
    setView("buscar");
  }

  // ── Tarjeta encontrada ──────────────────────────────────
  if (view === "tarjeta" && card) {
    return (
      <div className="animate-[pop-in_0.5s_cubic-bezier(0.34,1.56,0.64,1)]">
        {card.created && (
          <p className="mb-4 rounded-2xl border-2 border-ink bg-mango px-5 py-3 text-center font-bold text-ink">
            ¡Bienvenido a Roa Brew! Tu tarjeta ya está activa.
          </p>
        )}

        <StampCard status={card.status} name={card.name} dni={card.dni} />

        <p className="mt-5 text-center text-lg text-cream/85">{card.message}</p>

        <div className="mt-6 text-center">
          <button
            onClick={reiniciar}
            className="rounded-full border-2 border-cream px-6 py-3 font-bold text-cream transition hover:bg-cream hover:text-roa-900"
          >
            Consultar otra tarjeta
          </button>
        </div>
      </div>
    );
  }

  // ── Registro ────────────────────────────────────────────
  if (view === "registrar") {
    return (
      <form
        onSubmit={registrar}
        className="mx-auto max-w-md rounded-[2rem] border-2 border-ink bg-cream p-7 text-ink shadow-[7px_7px_0_var(--color-ink)]"
      >
        <p className="font-hand text-3xl text-roa-500">aún no tienes tarjeta</p>
        <h3 className="mt-1 font-display text-3xl leading-none">Créala gratis</h3>
        <p className="mt-3 text-sm text-ink/60">
          Toma diez segundos. Después pide tu primer sello en barra.
        </p>

        <label className="mt-5 block">
          <span className="mb-1.5 block text-sm font-bold text-roa-700">Documento</span>
          <input
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            inputMode="numeric"
            className={INPUT}
            readOnly
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-bold text-roa-700">Tu nombre</span>
          <input
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre y apellido"
            className={INPUT}
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-bold text-roa-700">WhatsApp</span>
          <input
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="tel"
            placeholder="999 999 999"
            className={INPUT}
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-bold text-roa-700">
            Fecha de nacimiento
          </span>
          <input
            required
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            max={new Date().toISOString().slice(0, 10)}
            className={INPUT}
          />
          <span className="mt-1 block text-xs text-ink/45">
            La usamos solo para regalarte una bebida en tu cumpleaños.
          </span>
        </label>

        {error && (
          <p className="mt-4 rounded-xl border-2 border-berry bg-berry/10 px-3 py-2 text-sm font-medium text-berry">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-shine mt-6 w-full rounded-full border-2 border-ink bg-roa-500 py-4 font-display text-xl text-cream transition hover:bg-roa-600 disabled:opacity-60"
        >
          {loading ? "Creando…" : "Crear mi tarjeta"}
        </button>

        <button
          type="button"
          onClick={reiniciar}
          className="mt-3 w-full text-center text-sm text-ink/45 transition hover:text-roa-600"
        >
          ← Volver
        </button>
      </form>
    );
  }

  // ── Buscar ──────────────────────────────────────────────
  return (
    <form onSubmit={buscar} className="mx-auto max-w-md">
      <label className="block">
        <span className="mb-2 block text-center font-hand text-3xl text-roa-200">
          ingresa tu DNI
        </span>
        <div className="relative">
          <input
            required
            autoFocus
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            inputMode="numeric"
            maxLength={12}
            placeholder="12345678"
            className="w-full rounded-full border-2 border-cream/25 bg-roa-900 py-5 pl-14 pr-5 text-center font-display text-2xl tracking-[0.3em] text-cream outline-none transition placeholder:tracking-normal placeholder:text-cream/25 focus:border-mango"
          />
          <SearchIcon className="pointer-events-none absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-cream/40" />
        </div>
      </label>

      {error && (
        <p className="mt-4 rounded-xl border-2 border-berry bg-berry/15 px-4 py-3 text-center text-sm font-medium text-berry">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-shine mt-5 w-full rounded-full border-2 border-ink bg-mango py-4 font-display text-2xl text-ink shadow-[5px_5px_0_var(--color-ink)] transition hover:translate-x-[-3px] hover:translate-y-[-3px] disabled:opacity-60"
      >
        {loading ? "Buscando…" : "Ver mi tarjeta"}
      </button>

      <p className="mt-4 text-center text-sm text-cream/50">
        ¿Primera vez? Ingresa tu DNI igual y te creamos la tarjeta al instante.
      </p>
    </form>
  );
}

const INPUT =
  "w-full rounded-xl border-2 border-ink/15 bg-white/70 px-4 py-3 text-ink outline-none transition placeholder:text-ink/30 focus:border-roa-500 read-only:bg-ink/5 read-only:text-ink/50";
