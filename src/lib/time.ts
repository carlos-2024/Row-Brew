/**
 * Hora de Perú.
 *
 * El contenedor de producción corre en UTC, así que `new Date()` y
 * `setHours(0,0,0,0)` daban la hora y el día equivocados: los pedidos salían
 * con 5 horas de más y "hoy" empezaba a las 7 de la noche del día anterior.
 *
 * Perú no tiene horario de verano desde 1994 —está fijo en UTC-5— pero el
 * desfase se calcula igual con `Intl`, no a mano: si algún día cambia, esto
 * sigue bien sin tocar nada.
 */

export const ZONA = "America/Lima";

/** Minutos que Lima va detrás de UTC en ese instante. Hoy: 300. */
function desfase(d: Date): number {
  // "sv-SE" da "2026-09-20 15:53:30", que Date sabe leer
  const enLima = new Date(
    new Intl.DateTimeFormat("sv-SE", {
      timeZone: ZONA,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
      .format(d)
      .replace(" ", "T") + "Z"
  );
  return (d.getTime() - enLima.getTime()) / 60000;
}

/**
 * El instante en que empezó el día peruano de `ref`.
 *
 * Devuelve un Date normal —el punto exacto en la línea de tiempo— para
 * comparar contra `createdAt`, que Prisma guarda en UTC.
 */
export function inicioDelDiaLima(ref = new Date()): Date {
  const [a, m, d] = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(ref)
    .split("-")
    .map(Number);

  // Medianoche de ese día tratada como UTC, corrida por el desfase
  const comoUtc = Date.UTC(a, m - 1, d);
  return new Date(comoUtc + desfase(ref) * 60000);
}

/** Medianoche peruana de hace `dias` días. */
export function haceDiasLima(dias: number, ref = new Date()): Date {
  const base = inicioDelDiaLima(ref);
  return inicioDelDiaLima(new Date(base.getTime() - dias * 86400000));
}

/** El primero del mes peruano en curso, a medianoche. */
export function inicioDelMesLima(ref = new Date()): Date {
  const [a, m] = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(ref)
    .split("-")
    .map(Number);

  return inicioDelDiaLima(new Date(Date.UTC(a, m - 1, 1, 12)));
}

/** "2026-09-20" del día peruano al que pertenece ese instante. */
export function fechaLima(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}
