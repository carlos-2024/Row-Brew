"use client";

import { useState } from "react";
import { PinIcon, SearchIcon, ScooterIcon, WhatsAppIcon } from "@/components/Icons";

type Resultado = {
  status: "gratis" | "costo" | "fuera";
  title: string;
  text: string;
  zone?: string;
  label?: string | null;
  precise?: boolean;
};

const TONOS = {
  gratis: {
    caja: "bg-mango text-ink",
    chip: "bg-ink text-mango",
  },
  costo: {
    caja: "bg-grape text-ink",
    chip: "bg-ink text-grape",
  },
  fuera: {
    caja: "bg-cream text-ink",
    chip: "bg-ink text-cream",
  },
} as const;

export default function ZoneChecker({ whatsapp }: { whatsapp: string }) {
  const [address, setAddress] = useState("");
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState<false | "texto" | "gps">(false);

  async function consultar(url: string, modo: "texto" | "gps") {
    setError(null);
    setResultado(null);
    setCargando(modo);
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "No pudimos consultar tu zona.");
      setResultado(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setCargando(false);
    }
  }

  function buscarPorTexto(e: React.FormEvent) {
    e.preventDefault();
    consultar(`/api/cobertura?q=${encodeURIComponent(address)}`, "texto");
  }

  function usarGps() {
    setError(null);
    setResultado(null);

    if (!navigator.geolocation) {
      setError("Tu navegador no permite compartir ubicación. Escribe tu dirección.");
      return;
    }

    setCargando("gps");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        consultar(`/api/cobertura?lat=${latitude}&lng=${longitude}`, "gps");
      },
      () => {
        setCargando(false);
        setError(
          "No pudimos leer tu ubicación. Revisa los permisos del navegador o escribe tu dirección."
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  const waTexto = resultado
    ? `¡Hola Roa Brew! Consulté mi zona de delivery y me sale: ${resultado.title}${
        resultado.label ? `\nMi dirección: ${resultado.label}` : ""
      }`
    : "¡Hola Roa Brew! Quiero consultar si llegan a mi zona.";

  return (
    <div className="rounded-[1.8rem] border-2 border-ink bg-roa-900 p-5 shadow-[5px_5px_0_var(--color-ink)] sm:p-6">
      <p className="font-display text-2xl text-cream">¿Llegamos a tu casa?</p>
      <p className="mt-1 text-sm text-cream/55">
        Escribe tu dirección y te decimos al toque cuánto te sale el envío.
      </p>

      <form onSubmit={buscarPorTexto} className="mt-4">
        <div className="relative">
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Av. Alfredo Mendiola 3500, Los Olivos"
            className="w-full rounded-full border-2 border-cream/20 bg-roa-950 py-3.5 pl-12 pr-4 text-cream outline-none transition placeholder:text-cream/30 focus:border-mango"
          />
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-cream/40" />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={cargando !== false || address.trim().length < 4}
            className="btn-shine flex-1 rounded-full border-2 border-ink bg-mango px-5 py-3 font-bold text-ink transition disabled:pointer-events-none disabled:opacity-40"
          >
            {cargando === "texto" ? "Buscando…" : "Consultar mi zona"}
          </button>
          <button
            type="button"
            onClick={usarGps}
            disabled={cargando !== false}
            className="inline-flex items-center gap-2 rounded-full border-2 border-cream/30 px-5 py-3 font-bold text-cream transition hover:border-cream hover:bg-cream/10 disabled:opacity-40"
          >
            <PinIcon className="h-5 w-5" />
            {cargando === "gps" ? "Ubicando…" : "Usar mi ubicación"}
          </button>
        </div>
      </form>

      {error && (
        <p className="mt-4 rounded-xl border-2 border-berry bg-berry/15 px-4 py-3 text-sm font-medium text-berry">
          {error}
        </p>
      )}

      {resultado && (
        <div
          className={`mt-4 animate-[pop-in_0.45s_cubic-bezier(0.34,1.56,0.64,1)] rounded-2xl border-2 border-ink p-5 ${TONOS[resultado.status].caja}`}
        >
          <div className="flex items-start gap-3">
            <span
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${TONOS[resultado.status].chip}`}
            >
              <ScooterIcon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="font-display text-xl leading-tight">{resultado.title}</p>
              <p className="mt-1 text-sm opacity-75">{resultado.text}</p>
              {resultado.label && (
                <p className="mt-2 truncate text-xs opacity-50" title={resultado.label}>
                  Según: {resultado.label}
                </p>
              )}
            </div>
          </div>

          {resultado.precise === false && (
            <p className="mt-3 rounded-xl border-2 border-ink/25 bg-ink/10 px-3 py-2 text-xs font-medium">
              Ubicamos la calle pero no el número exacto, así que este resultado es
              aproximado. Para estar seguro, usa <strong>Usar mi ubicación</strong> o
              confírmanos por WhatsApp.
            </p>
          )}

          <a
            href={`https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(waTexto)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-[#25D366] px-5 py-2.5 font-bold text-ink transition hover:brightness-95"
          >
            <WhatsAppIcon className="h-5 w-5" />
            Pedir por WhatsApp
          </a>
        </div>
      )}

      <p className="mt-4 text-xs text-cream/35">
        La ubicación es referencial. Confirmamos la dirección exacta al coordinar tu
        pedido.
      </p>
    </div>
  );
}
