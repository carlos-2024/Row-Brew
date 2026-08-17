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
};

export function loyaltyStatus(
  customer: Pick<
    LoyaltyCustomer,
    "stamps" | "cycles" | "totalStamps" | "midRewardUsed"
  >
): LoyaltyStatus {
  const stamps = Math.min(customer.stamps, LOYALTY_GOAL);
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
  };
}

/** Mensaje motivador según en qué punto de la tarjeta va. */
export function loyaltyMessage(s: LoyaltyStatus): string {
  if (s.fullAvailable) return "¡Tarjeta llena! Tu próxima bebida va por la casa 🎉";
  if (s.midAvailable)
    return "Ya puedes agrandar tu bebida o pedir una de cortesía. Solo dilo en barra.";
  if (s.toMid === 1) return "Un sello más y desbloqueas tu premio intermedio.";
  if (s.toFull === 1) return "¡Un sello más y la siguiente es gratis!";
  if (s.stamps === 0) return "Tu tarjeta está lista. El primer sello te lo damos en barra.";
  return `Te faltan ${s.toFull} sellos para tu bebida gratis.`;
}
