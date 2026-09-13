import { getSettings } from "@/lib/settings";
import { classify, getZones } from "@/lib/coverage";
import { toNumber } from "@/lib/format";

export type ZonaEnvio = "gratis" | "costo" | "fuera" | "desconocida";

/** Lo que el carrito necesita saber de una dirección ya ubicada. */
export type DireccionResuelta = {
  label: string;
  lat: number;
  lng: number;
  precise: boolean;
  zone: ZonaEnvio;
  fee: number;
  message: string | null;
};

/**
 * Clasifica un punto contra el mapa de cobertura.
 *
 * Vive aparte porque ahora hay dos caminos que llegan a coordenadas —la lista
 * de OpenStreetMap, que ya las trae, y el detalle de Google al elegir— y la
 * regla del envío tiene que ser la misma en ambos.
 */
export async function resolverEnvio(
  puntos: { label: string; lat: number; lng: number; precise: boolean }[]
): Promise<DireccionResuelta[]> {
  if (puntos.length === 0) return [];

  const settings = await getSettings();
  const zones = await getZones(settings.deliveryMapUrl);
  const feePaid = toNumber(settings.deliveryFeePaid) || 0;

  return puntos.map((p) => {
    const zona = zones.length > 0 ? classify(p.lat, p.lng, zones) : null;
    const status: ZonaEnvio = zona?.status ?? "desconocida";

    return {
      label: p.label,
      lat: p.lat,
      lng: p.lng,
      precise: p.precise,
      zone: status,
      fee: status === "costo" ? feePaid : 0,
      message:
        status === "gratis"
          ? settings.deliveryTextFree
          : status === "costo"
            ? settings.deliveryTextPaid
            : status === "fuera"
              ? settings.deliveryTextOutside
              : null,
    };
  });
}
