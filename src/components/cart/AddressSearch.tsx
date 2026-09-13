"use client";

import { useEffect, useRef, useState } from "react";
import { SearchIcon, ScooterIcon } from "@/components/Icons";

export type Direccion = {
  label: string;
  /** null cuando el cliente escribió la dirección a mano */
  lat: number | null;
  lng: number | null;
  precise: boolean;
  zone: "gratis" | "costo" | "fuera" | "desconocida";
  fee: number;
  message: string | null;
};

/**
 * Sugerencia de Google: todavía sin coordenadas. Se piden al elegirla, así
 * no se paga el detalle de las cinco sugerencias en cada tecla.
 */
type SugerenciaGoogle = {
  placeId: string;
  label: string;
  main: string;
  secondary: string;
};

type Sugerencia = Direccion | SugerenciaGoogle;

const esGoogle = (s: Sugerencia): s is SugerenciaGoogle => "placeId" in s;

/**
 * Token que agrupa las consultas de una misma búsqueda. Google cobra la sesión
 * completa —todas las teclas más el detalle final— como una sola búsqueda.
 */
function nuevoToken(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
}

const MENSAJE_MANUAL =
  "Te confirmamos por WhatsApp si llegamos a tu zona y cuánto cuesta el envío.";

const INPUT =
  "w-full rounded-xl border-2 border-ink/15 bg-white/70 px-4 py-3 pl-11 text-ink outline-none transition placeholder:text-ink/30 focus:border-roa-500";

const TONO = {
  gratis: "border-ink bg-mango text-ink",
  costo: "border-ink bg-grape text-ink",
  fuera: "border-ink/25 bg-white/70 text-ink",
  desconocida: "border-ink/25 bg-white/70 text-ink",
} as const;

/**
 * Buscador predictivo de direcciones con cálculo de zona.
 *
 * Se elige de una lista en vez de escribir libre: así se obtienen las
 * coordenadas exactas del portal, que es lo único que permite decir con
 * certeza si la dirección cae dentro de la zona de reparto gratuito.
 */
export default function AddressSearch({
  value,
  onChange,
  currency,
}: {
  value: Direccion | null;
  onChange: (d: Direccion | null) => void;
  currency: string;
}) {
  const [texto, setTexto] = useState(value?.label ?? "");
  const [sugerencias, setSugerencias] = useState<Sugerencia[]>([]);
  /** Mientras se piden las coordenadas de la sugerencia elegida */
  const [resolviendo, setResolviendo] = useState(false);
  const [errorDetalle, setErrorDetalle] = useState<string | null>(null);
  const sesion = useRef<string | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const [manual, setManual] = useState(false);
  const timer = useRef<number | null>(null);
  const aborto = useRef<AbortController | null>(null);
  /** Lo ya consultado en esta sesión: escribir y borrar no vuelve a pedirlo */
  const cache = useRef(new Map<string, Sugerencia[]>());

  useEffect(() => {
    if (manual) return;
    if (value && texto === value.label) return;

    const q = texto.trim();
    if (q.length < 3) {
      setSugerencias([]);
      setBuscando(false);
      return;
    }

    // Si ya se buscó ese texto, se responde al instante
    const guardado = cache.current.get(q.toLowerCase());
    if (guardado) {
      setSugerencias(guardado);
      setAbierto(true);
      return;
    }

    setBuscando(true);
    if (timer.current) window.clearTimeout(timer.current);

    // 250 ms: suficiente para no consultar en cada tecla, lo bastante corto
    // para que se sienta como un autocompletado de verdad
    timer.current = window.setTimeout(async () => {
      // Se cancela la consulta anterior: si el usuario siguió escribiendo, su
      // respuesta ya no sirve y podría pisar a la nueva
      aborto.current?.abort();
      const ctrl = new AbortController();
      aborto.current = ctrl;

      try {
        if (!sesion.current) sesion.current = nuevoToken();
        const res = await fetch(
          `/api/direcciones?q=${encodeURIComponent(q)}&s=${sesion.current}`,
          { signal: ctrl.signal }
        );
        const data = await res.json();
        const results: Sugerencia[] = data.results ?? [];
        cache.current.set(q.toLowerCase(), results);
        setSugerencias(results);
        setAbierto(true);
      } catch (e) {
        if ((e as Error).name !== "AbortError") setSugerencias([]);
      } finally {
        if (!ctrl.signal.aborted) setBuscando(false);
      }
    }, 250);

    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [texto, value, manual]);

  async function elegir(s: Sugerencia) {
    setAbierto(false);
    setErrorDetalle(null);

    if (!esGoogle(s)) {
      onChange(s);
      setTexto(s.label);
      setSugerencias([]);
      return;
    }

    // De Google llega sin coordenadas: se piden ahora, una sola vez
    setTexto(s.label);
    setResolviendo(true);
    try {
      const token = sesion.current ? `&s=${sesion.current}` : "";
      const res = await fetch(
        `/api/direcciones/detalle?placeId=${encodeURIComponent(s.placeId)}${token}`
      );
      const data = await res.json();
      if (!res.ok || !data.result) {
        throw new Error(data.error ?? "No pudimos ubicar esa dirección. Escríbela a mano.");
      }

      const d: Direccion = data.result;
      const label = d.label || s.label;
      setTexto(label);
      onChange({ ...d, label });
      setSugerencias([]);
    } catch (e) {
      setErrorDetalle((e as Error).message || "No pudimos ubicar esa dirección. Escríbela a mano.");
    } finally {
      setResolviendo(false);
      // La sesión se cierra con el detalle: la próxima búsqueda es otra
      sesion.current = null;
    }
  }

  /**
   * Salida de emergencia: ningún buscador tiene todas las direcciones —una
   * casa nueva, un pasaje sin nombre—, y antes eso dejaba al cliente sin poder
   * pedir. La escribe a mano y el envío se acuerda por WhatsApp.
   */
  function escribirAMano() {
    setManual(true);
    setAbierto(false);
    setSugerencias([]);
    onChange(null);
  }

  function volverAlBuscador() {
    setManual(false);
    setTexto("");
    onChange(null);
  }

  function guardarManual(v: string) {
    const limpio = v.trim();
    onChange(
      limpio.length >= 8
        ? {
            label: limpio,
            lat: null,
            lng: null,
            precise: false,
            zone: "desconocida",
            fee: 0,
            message: MENSAJE_MANUAL,
          }
        : null,
    );
  }

  // ── Modo manual ──
  if (manual) {
    return (
      <div>
        <textarea
          defaultValue={value?.label ?? texto}
          onChange={(e) => guardarManual(e.target.value)}
          rows={2}
          placeholder="Ej: Jr. Manuel Rivero 389, Los Olivos"
          className={`${INPUT} resize-none pl-4`}
          autoComplete="off"
        />
        <p className="mt-2 text-xs leading-snug text-ink/50">
          Escribe calle, número, referencia y distrito. {MENSAJE_MANUAL}
        </p>
        <button
          type="button"
          onClick={volverAlBuscador}
          className="mt-2 text-xs font-bold text-roa-600 underline underline-offset-2"
        >
          Volver al buscador
        </button>

        {value && (
          <div className="mt-3 rounded-2xl border-2 border-ink/25 bg-white/70 p-4 text-ink">
            <p className="flex items-center gap-2 font-display text-lg leading-none">
              <ScooterIcon className="h-5 w-5" />
              Envío por confirmar
            </p>
            <p className="mt-1.5 text-xs leading-snug opacity-75">{MENSAJE_MANUAL}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="relative">
        <input
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value);
            setErrorDetalle(null);
            if (value) onChange(null);
          }}
          onFocus={() => sugerencias.length > 0 && setAbierto(true)}
          placeholder="Empieza a escribir tu dirección…"
          className={INPUT}
          autoComplete="off"
        />
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink/35" />
        {(buscando || resolviendo) && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink/40">
            {resolviendo ? "calculando envío…" : "buscando…"}
          </span>
        )}
      </div>

      {/* Sugerencias */}
      {abierto && sugerencias.length > 0 && (
        <ul className="mt-2 max-h-56 overflow-y-auto rounded-xl border-2 border-ink/15 bg-white">
          {sugerencias.map((s, i) => (
            <li key={esGoogle(s) ? s.placeId : i}>
              <button
                type="button"
                onClick={() => elegir(s)}
                className="flex w-full items-start gap-3 border-b border-ink/8 px-3 py-2.5 text-left transition last:border-0 hover:bg-roa-100"
              >
                {esGoogle(s) ? (
                  <>
                    {/* De Google aún no se sabe la zona: se calcula al elegir */}
                    <span className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full border-2 border-ink/30" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-ink/85">
                        {s.main}
                      </span>
                      {s.secondary && (
                        <span className="block truncate text-xs text-ink/50">
                          {s.secondary}
                        </span>
                      )}
                    </span>
                  </>
                ) : (
                  <>
                    <span
                      className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                        s.zone === "gratis"
                          ? "bg-mango"
                          : s.zone === "costo"
                            ? "bg-grape"
                            : "bg-ink/25"
                      }`}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-ink/85">{s.label}</span>
                      <span className="text-xs font-bold text-ink/45">
                        {s.zone === "gratis"
                          ? "Envío gratis"
                          : s.zone === "costo"
                            ? `Envío ${currency} ${s.fee.toFixed(2)}`
                            : "Fuera de zona"}
                      </span>
                    </span>
                  </>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {abierto && !buscando && sugerencias.length === 0 && texto.trim().length >= 3 && (
        <div className="mt-2 rounded-xl border-2 border-ink/12 bg-white/60 px-3 py-2.5">
          <p className="text-xs leading-snug text-ink/50">
            No encontramos esa dirección. Prueba solo con la calle y el distrito.
          </p>
          <button
            type="button"
            onClick={escribirAMano}
            className="mt-1.5 text-xs font-bold text-roa-600 underline underline-offset-2"
          >
            Escribirla a mano
          </button>
        </div>
      )}

      {errorDetalle && !value && (
        <div className="mt-2 rounded-xl border-2 border-ink/12 bg-white/60 px-3 py-2.5">
          <p className="text-xs leading-snug text-ink/60">{errorDetalle}</p>
          <button
            type="button"
            onClick={escribirAMano}
            className="mt-1.5 text-xs font-bold text-roa-600 underline underline-offset-2"
          >
            Escribirla a mano
          </button>
        </div>
      )}

      {/* Siempre a la vista: hay calles que el mapa no tiene */}
      {!value && !(abierto && sugerencias.length === 0 && texto.trim().length >= 3) && (
        <button
          type="button"
          onClick={escribirAMano}
          className="mt-2 text-xs font-bold text-ink/45 underline underline-offset-2 transition hover:text-roa-600"
        >
          ¿No aparece tu dirección? Escríbela a mano
        </button>
      )}

      {/* Resultado */}
      {value && (
        <div
          className={`mt-3 rounded-2xl border-2 p-4 ${TONO[value.zone]} animate-[pop-in_0.4s_cubic-bezier(0.34,1.56,0.64,1)]`}
        >
          <p className="flex items-center gap-2 font-display text-lg leading-none">
            <ScooterIcon className="h-5 w-5" />
            {value.zone === "gratis"
              ? "Delivery gratis"
              : value.zone === "costo"
                ? `Delivery ${currency} ${value.fee.toFixed(2)}`
                : "Fuera de zona"}
          </p>
          {value.message && (
            <p className="mt-1.5 text-xs leading-snug opacity-75">{value.message}</p>
          )}
          {!value.precise && (
            <p className="mt-2 text-[11px] opacity-60">
              Ubicamos la calle pero no el número exacto. Lo confirmamos contigo por
              WhatsApp.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
