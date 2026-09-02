"use client";

import { useState } from "react";
import { DIAS, MESES, monthGrid, todayUtc, toIsoDate } from "@/lib/events";

type Props = {
  /** Fechas no disponibles, en formato YYYY-MM-DD */
  blocked: string[];
  /** Fecha elegida */
  value?: string | null;
  onSelect?: (iso: string) => void;
  /** En el panel se pueden elegir días pasados; en el sitio público no */
  allowPast?: boolean;
  /** Marca los días bloqueados como seleccionables (para el panel) */
  selectableBlocked?: boolean;
  /** Tema: el sitio va sobre crema, el panel sobre verde oscuro */
  tone?: "light" | "dark";
};

/**
 * Calendario mensual. Sin librerías: una grilla de 42 celdas que empieza
 * en lunes, con los días no disponibles deshabilitados.
 */
export default function Calendar({
  blocked,
  value,
  onSelect,
  allowPast = false,
  selectableBlocked = false,
  tone = "light",
}: Props) {
  const hoy = todayUtc();
  const [cursor, setCursor] = useState(() => ({
    year: hoy.getUTCFullYear(),
    month: hoy.getUTCMonth(),
  }));

  const celdas = monthGrid(cursor.year, cursor.month);
  const hoyIso = toIsoDate(hoy);
  const bloqueadas = new Set(blocked);

  const mover = (delta: number) => {
    setCursor((c) => {
      const d = new Date(Date.UTC(c.year, c.month + delta, 1));
      return { year: d.getUTCFullYear(), month: d.getUTCMonth() };
    });
  };

  const t =
    tone === "dark"
      ? {
          caja: "border-cream/12 bg-roa-950",
          titulo: "text-cream",
          nav: "border-cream/20 text-cream hover:bg-cream/10",
          dia: "text-cream/35",
          libre: "text-cream/80 hover:bg-roa-700",
          hoy: "ring-2 ring-mango",
          elegido: "bg-mango text-ink font-bold",
          bloqueado: "bg-berry/25 text-berry line-through",
          fuera: "text-cream/15",
        }
      : {
          caja: "border-ink/12 bg-white/70",
          titulo: "text-ink",
          nav: "border-ink/20 text-ink hover:bg-ink/10",
          dia: "text-ink/35",
          libre: "text-ink/80 hover:bg-roa-200",
          hoy: "ring-2 ring-roa-500",
          elegido: "bg-roa-500 text-cream font-bold",
          bloqueado: "bg-berry/15 text-berry line-through",
          fuera: "text-ink/15",
        };

  return (
    <div className={`rounded-2xl border-2 p-4 ${t.caja}`}>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => mover(-1)}
          aria-label="Mes anterior"
          className={`grid h-8 w-8 place-items-center rounded-full border-2 transition ${t.nav}`}
        >
          ‹
        </button>
        <p className={`font-display text-lg capitalize ${t.titulo}`}>
          {MESES[cursor.month]} {cursor.year}
        </p>
        <button
          type="button"
          onClick={() => mover(1)}
          aria-label="Mes siguiente"
          className={`grid h-8 w-8 place-items-center rounded-full border-2 transition ${t.nav}`}
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {DIAS.map((d, i) => (
          <span
            key={i}
            className={`py-1 text-center text-[11px] font-black uppercase ${t.dia}`}
          >
            {d}
          </span>
        ))}

        {celdas.map((iso, i) => {
          if (!iso) return <span key={i} className="aspect-square" />;

          const dia = Number(iso.slice(8, 10));
          const esBloqueada = bloqueadas.has(iso);
          const esPasada = !allowPast && iso < hoyIso;
          const esHoy = iso === hoyIso;
          const elegida = value === iso;

          const deshabilitada = esPasada || (esBloqueada && !selectableBlocked);

          return (
            <button
              key={iso}
              type="button"
              disabled={deshabilitada}
              onClick={() => onSelect?.(iso)}
              title={esBloqueada ? "No disponible" : undefined}
              className={`aspect-square rounded-lg text-sm transition ${
                elegida
                  ? t.elegido
                  : esBloqueada
                    ? t.bloqueado
                    : deshabilitada
                      ? t.fuera
                      : t.libre
              } ${esHoy && !elegida ? t.hoy : ""} ${
                deshabilitada ? "cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              {dia}
            </button>
          );
        })}
      </div>
    </div>
  );
}
