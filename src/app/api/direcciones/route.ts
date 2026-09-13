import { NextResponse } from "next/server";
import { suggestFast } from "@/lib/geocode";
import { resolverEnvio } from "@/lib/deliveryZone";
import { autocomplete, googleKey, isSessionToken } from "@/lib/googlePlaces";

export const dynamic = "force-dynamic";

/**
 * Buscador predictivo de direcciones.
 *
 * Con GOOGLE_MAPS_API_KEY configurada devuelve sugerencias de Google, sin
 * coordenadas: el carrito pide el detalle a /api/direcciones/detalle solo
 * cuando el cliente elige una.
 *
 * Sin clave, o si Google falla, sigue con OpenStreetMap y cada sugerencia
 * trae ya su zona de envío, como antes. Así el carrito nunca se queda sin
 * buscador por una clave mal restringida o una cuota agotada.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const q = (params.get("q") ?? "").trim().slice(0, 200);
  if (q.length < 3) return NextResponse.json({ provider: "none", results: [] });

  const key = googleKey();
  if (key) {
    const session = params.get("s");
    try {
      const results = await autocomplete(q, isSessionToken(session) ? session : null, key);
      return NextResponse.json({ provider: "google", results });
    } catch (error) {
      // Queda en los logs de EasyPanel con el motivo de Google (clave inválida,
      // IP no autorizada, API sin habilitar…). Sin esto, caer a OpenStreetMap
      // en silencio haría creer que Google funciona.
      console.error("[GET /api/direcciones] Google Places falló, se usa OpenStreetMap:", error);
    }
  }

  try {
    const hits = await suggestFast(q, 5);
    const results = await resolverEnvio(hits);
    return NextResponse.json({ provider: "osm", results });
  } catch (error) {
    console.error("[GET /api/direcciones]", error);
    return NextResponse.json({ provider: "osm", results: [] });
  }
}
