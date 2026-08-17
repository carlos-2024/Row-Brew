import type { LoyaltyCustomer } from "@prisma/client";

/** Meta completa de la tarjeta y meta intermedia. */
export const LOYALTY_GOAL = 10;
export const LOYALTY_MID_GOAL = 5;

/** Normaliza un documento: solo dígitos y letras, en mayúscula. */
export function normalizeDni(value: string): string {
  return value.replace(/[^0-9a-zA-Z]/g, "").toUpperCase();
}

/** DNI peruano son 8 dígitos; el carné de extranjería llega hasta 12. */
export function isValidDni(value: string): boolean {
  const clean = normalizeDni(value);
  return clean.length >= 8 && clean.length <= 12;
}

/** Oculta el documento para no exponerlo en pantalla: 4****789 */
export function maskDni(dni: string): string {
  if (dni.length <= 4) return "•".repeat(dni.length);
  return `${dni.slice(0, 1)}${"•".repeat(dni.length - 4)}${dni.slice(-3)}`;
}

/** Solo el nombre de pila y la inicial del apellido: "Carlos B." */
export function shortName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[1].charAt(0).toUpperCase()}.`;
}

/** Días que dura el premio de cumpleaños a partir de la fecha. */
export const BIRTHDAY_WINDOW_DAYS = 7;

/** Teléfono peruano: 9 dígitos. Se acepta con o sin espacios. */
export function isValidPhone(value: string): boolean {
  return value.replace(/\D/g, "").length >= 9;
}

/**
 * ¿Está dentro de su semana de cumpleaños?
 *
 * Se compara solo día y mes, y la ventana se abre el día del cumpleaños y
 * dura una semana. Se resuelve en UTC para que no cambie según la zona
 * horaria del servidor.
 */
export function isBirthdayWindow(birthday: Date | null, now = new Date()): boolean {
  if (!birthday) return false;

  const year = now.getUTCFullYear();
  const start = Date.UTC(year, birthday.getUTCMonth(), birthday.getUTCDate());
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const dayMs = 86_400_000;

  // La ventana del año en curso…
  if (today >= start && today <= start + BIRTHDAY_WINDOW_DAYS * dayMs) return true;

  // …y la del año anterior, para cumpleaños de fin de diciembre.
  const prev = Date.UTC(year - 1, birthday.getUTCMonth(), birthday.getUTCDate());
  return today >= prev && today <= prev + BIRTHDAY_WINDOW_DAYS * dayMs;
}

/** dd/mm para mostrar sin exponer el año de nacimiento. */
export function formatBirthday(birthday: Date | null): string | null {
  if (!birthday) return null;
  const d = String(birthday.getUTCDate()).padStart(2, "0");
  const m = String(birthday.getUTCMonth() + 1).padStart(2, "0");
  return `${d}/${m}`;
}

/** Convierte el valor de un <input type="date"> a Date en UTC. */
export function parseBirthday(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const [, y, m, d] = match;
  const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
  if (Number.isNaN(date.getTime())) return null;
  // Descarta fechas absurdas
  const year = date.getUTCFullYear();
  if (year < 1900 || date.getTime() > Date.now()) return null;
  return date;
}

export type LoyaltyStatus = {
  stamps: number;
  goal: number;
  midGoal: number;
  cycles: number;
  totalStamps: number;
  /** Puede canjear el premio intermedio ahora mismo */
  midAvailable: boolean;
  midRewardUsed: boolean;
  /** Completó la tarjeta y puede canjear la bebida gratis */
  fullAvailable: boolean;
  /** Cuántos sellos faltan para la bebida gratis */
  toFull: number;
  /** Cuántos sellos faltan para el premio intermedio */
  toMid: number;
  /** Está en su semana de cumpleaños y aún no canjeó el premio este año */
  birthdayAvailable: boolean;
  /** Está en su semana de cumpleaños (lo haya canjeado o no) */
  isBirthdayWeek: boolean;
  /** dd/mm, o null si no lo registró */
  birthday: string | null;
};

export function loyaltyStatus(
  customer: Pick<
    LoyaltyCustomer,
    | "stamps"
    | "cycles"
    | "totalStamps"
    | "midRewardUsed"
    | "birthday"
    | "birthdayRewardYear"
  >,
  now = new Date()
): LoyaltyStatus {
  const stamps = Math.min(customer.stamps, LOYALTY_GOAL);
  const inWindow = isBirthdayWindow(customer.birthday, now);

  return {
    stamps,
    goal: LOYALTY_GOAL,
    midGoal: LOYALTY_MID_GOAL,
    cycles: customer.cycles,
    totalStamps: customer.totalStamps,
    midAvailable: stamps >= LOYALTY_MID_GOAL && !customer.midRewardUsed,
    midRewardUsed: customer.midRewardUsed,
    fullAvailable: stamps >= LOYALTY_GOAL,
    toFull: Math.max(0, LOYALTY_GOAL - stamps),
    toMid: Math.max(0, LOYALTY_MID_GOAL - stamps),
    isBirthdayWeek: inWindow,
    birthdayAvailable:
      inWindow && customer.birthdayRewardYear !== now.getUTCFullYear(),
    birthday: formatBirthday(customer.birthday),
  };
}

/** Mensaje motivador según en qué punto de la tarjeta va. */
export function loyaltyMessage(s: LoyaltyStatus): string {
  if (s.birthdayAvailable)
    return "¡Feliz cumpleaños! Tienes una bebida de regalo esperándote en barra.";
  if (s.fullAvailable) return "¡Tarjeta llena! Tu próxima bebida va por la casa.";
  if (s.midAvailable)
    return "Ya puedes agrandar tu bebida o pedir una de cortesía. Solo dilo en barra.";
  if (s.toMid === 1) return "Un sello más y desbloqueas tu premio intermedio.";
  if (s.toFull === 1) return "¡Un sello más y la siguiente es gratis!";
  if (s.stamps === 0) return "Tu tarjeta está lista. El primer sello te lo damos en barra.";
  return `Te faltan ${s.toFull} sellos para tu bebida gratis.`;
}
