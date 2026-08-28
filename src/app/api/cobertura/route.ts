import { NextResponse } from "next/server";
import { getSettings } from "@/lib/settings";
import { classify, getZones } from "@/lib/coverage";
import { geocode } from "@/lib/geocode";

export const dynamic = "force-dynamic";

/**
 * Consulta de cobertura.
 *
 * Acepta dos formas:
 *   ?lat=..&lng=..   coordenadas exactas (GPS del navegador)
 *   ?q=<dirección>   texto, que se geocodifica antes de evaluar
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const settings = await getSettings();

  const zones = await getZones(settings.deliveryMapUrl);
  if (zones.length === 0) {
    return NextResponse.json(
      { error: "No pudimos cargar las zonas de cobertura. Escríbenos por WhatsApp." },
      { status: 503 }
    );
  }

  let lat = Number(searchParams.get("lat"));
  let lng = Number(searchParams.get("lng"));
  let label: string | null = null;
  // El GPS del navegador siempre es exacto; la dirección escrita, no siempre
  let precise = true;

  const usaCoordenadas = Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0);

  if (!usaCoordenadas) {
    const q = (searchParams.get("q") ?? "").trim();
    if (q.length < 4) {
      return NextResponse.json(
        { error: "Escribe tu dirección con un poco más de detalle." },
        { status: 400 }
      );
    }

    const hit = await geocode(q);
    if (!hit) {
      return NextResponse.json(
        {
          error:
            "No encontramos esa dirección. Prueba con la avenida o calle y el distrito, o usa el botón de ubicación.",
        },
        { status: 404 }
      );
    }

    lat = hit.lat;
    lng = hit.lng;
    label = hit.label;
    precise = hit.precise;
  }

  const result = classify(lat, lng, zones);

  const mensajes = {
    gratis: {
      title: "¡Estás en zona de delivery gratis!",
      text: settings.deliveryZoneFreeText,
    },
    costo: {
      title: "Llegamos a tu zona",
      text: settings.deliveryZonePaidText,
    },
    fuera: {
      title: "Estás fuera de nuestras zonas",
      text: settings.deliveryZoneOutsideText,
    },
  } as const;

  return NextResponse.json({
    ...result,
    ...mensajes[result.status],
    label,
    precise,
    // Se devuelven para que el mapa del cliente pueda centrarse si hiciera falta
    lat,
    lng,
  });
}
