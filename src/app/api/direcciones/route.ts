import { NextResponse } from "next/server";
import { getSettings } from "@/lib/settings";
import { suggestFast } from "@/lib/geocode";
import { classify, getZones } from "@/lib/coverage";
import { toNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

/**
 * Buscador predictivo de direcciones.
 *
 * Devuelve hasta cinco candidatos y, con cada uno, en qué zona de reparto cae
 * y cuánto costaría el envío. Así el cliente ve el costo antes de elegir, sin
 * una segunda llamada.
 */
export async function GET(request: Request) {
  const q = (new URL(request.url).searchParams.get("q") ?? "").trim();
  if (q.length < 3) return NextResponse.json({ results: [] });

  try {
    const settings = await getSettings();
    const [hits, zones] = await Promise.all([
      suggestFast(q, 5),
      getZones(settings.deliveryMapUrl),
    ]);

    const feePaid = toNumber(settings.deliveryFeePaid) || 0;

    const results = hits.map((h) => {
      const zona = zones.length > 0 ? classify(h.lat, h.lng, zones) : null;
      const status = zona?.status ?? "desconocida";

      return {
        label: h.label,
        lat: h.lat,
        lng: h.lng,
        precise: h.precise,
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

    return NextResponse.json({ results });
  } catch (error) {
    console.error("[GET /api/direcciones]", error);
    return NextResponse.json({ results: [] });
  }
}
