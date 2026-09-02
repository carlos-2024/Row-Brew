"use client";

import { useState } from "react";
import Calendar from "@/components/events/Calendar";
import { toggleBlockedDate } from "@/app/admin/actions";
import { formatEventDate, toUtcDate } from "@/lib/events";
import { Button } from "@/components/admin/ui";

/**
 * Calendario del panel para marcar días no disponibles.
 *
 * Al tocar un día se abre la confirmación: bloquear si estaba libre, liberar
 * si ya estaba bloqueado. Los días de eventos confirmados también llegan
 * marcados, pero esos no se tocan desde acá.
 */
export default function BlockDateCalendar({
  blocked,
  locked,
}: {
  /** Días bloqueados a mano */
  blocked: string[];
  /** Días ocupados por eventos confirmados, no editables */
  locked: string[];
}) {
  const [elegido, setElegido] = useState<string | null>(null);

  const estaBloqueado = elegido ? blocked.includes(elegido) : false;
  const estaConfirmado = elegido ? locked.includes(elegido) : false;

  return (
    <div>
      <Calendar
        blocked={[...blocked, ...locked]}
        value={elegido}
        onSelect={setElegido}
        selectableBlocked
        tone="dark"
      />

      <div className="mt-3 flex flex-wrap gap-4 text-xs text-cream/45">
        <span className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded bg-berry/25" />
          No disponible
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded ring-2 ring-mango" />
          Hoy
        </span>
      </div>

      {elegido && (
        <div className="mt-4 rounded-2xl border-2 border-cream/12 bg-roa-950 p-4">
          <p className="text-sm font-bold capitalize text-cream">
            {formatEventDate(toUtcDate(elegido)!)}
          </p>

          {estaConfirmado ? (
            <p className="mt-2 text-sm text-mango">
              Este día tiene un evento confirmado, por eso aparece ocupado. Para
              liberarlo, cambia el estado de esa solicitud.
            </p>
          ) : (
            <form action={toggleBlockedDate} className="mt-3 flex flex-wrap gap-2">
              <input type="hidden" name="date" value={elegido} />
              {!estaBloqueado && (
                <input
                  name="reason"
                  placeholder="Motivo (opcional)"
                  className="min-w-[12rem] flex-1 rounded-xl border-2 border-cream/12 bg-roa-900 px-4 py-2.5 text-cream outline-none placeholder:text-cream/25 focus:border-roa-400"
                />
              )}
              <Button variant={estaBloqueado ? "ghost" : "primary"}>
                {estaBloqueado ? "Liberar este día" : "Marcar no disponible"}
              </Button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
