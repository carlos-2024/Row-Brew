/**
 * Utilidades del calendario de eventos.
 *
 * Todo se maneja como fecha sin hora, en UTC, y se transporta como texto
 * `YYYY-MM-DD`. Así el día que elige el cliente es el mismo que ve el equipo,
 * sin importar la zona horaria del navegador ni la del servidor.
 */

export const EVENT_STATUS_LABELS: Record<string, string> = {
  NUEVA: "Nueva",
  CONTACTADO: "Contactado",
  COTIZADO: "Cotizado",
  CONFIRMADO: "Confirmado",
  CERRADO: "Cerrado",
  DESCARTADO: "Descartado",
};

/** Tipos de evento por defecto, editables desde Ajustes. */
export const DEFAULT_EVENT_TYPES = [
  "Cumpleaños",
  "Corporativo",
  "Feria o activación",
  "Matrimonio",
  "Baby shower",
  "Otro",
];

export function parseEventTypes(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

/** "2026-09-18" → Date en medianoche UTC */
export function toUtcDate(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) return null;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Date → "2026-09-18" */
export function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Hoy a medianoche UTC, para comparar sin que la hora estorbe. */
export function todayUtc(): Date {
  const n = new Date();
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()));
}

export function formatEventDate(d: Date): string {
  return new Intl.DateTimeFormat("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

/** ROA-EV-7K2M */
export function eventCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 4; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return `ROA-EV-${out}`;
}

export const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

/** Iniciales de los días, empezando en lunes. */
export const DIAS = ["L", "M", "M", "J", "V", "S", "D"];

/**
 * Construye la grilla de un mes: 42 celdas (6 semanas) empezando en lunes.
 * Las celdas fuera del mes vienen como null para dibujarlas vacías.
 */
export function monthGrid(year: number, month: number): (string | null)[] {
  const primero = new Date(Date.UTC(year, month, 1));
  // getUTCDay: 0 = domingo. Se desplaza para que la semana empiece en lunes.
  const offset = (primero.getUTCDay() + 6) % 7;
  const dias = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  const celdas: (string | null)[] = Array(offset).fill(null);
  for (let d = 1; d <= dias; d++) {
    celdas.push(toIsoDate(new Date(Date.UTC(year, month, d))));
  }
  while (celdas.length % 7 !== 0) celdas.push(null);
  return celdas;
}
