import { NextResponse } from "next/server";
import { resolverEnvio } from "@/lib/deliveryZone";
import {
  GooglePlacesError,
  googleKey,
  isPlaceId,
  isSessionToken,
  placeDetails,
} from "@/lib/googlePlaces";

export const dynamic = "force-dynamic";

/**
 * Coordenadas y zona de envío de una sugerencia de Google ya elegida.
 *
 * Es la segunda mitad del flujo de /api/direcciones: se llama una vez por
 * dirección elegida, no por tecla, y cierra la sesión de autocompletado.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const placeId = params.get("placeId");
  const session = params.get("s");

  if (!isPlaceId(placeId)) {
    return NextResponse.json({ error: "Dirección no válida." }, { status: 400 });
  }

  const key = googleKey();
  if (!key) {
    return NextResponse.json(
      { error: "El buscador de Google no está configurado." },
      { status: 503 }
    );
  }

  try {
    const lugar = await placeDetails(placeId, isSessionToken(session) ? session : null, key);
    if (!lugar) {
      return NextResponse.json(
        { error: "No pudimos ubicar esa dirección en el mapa." },
        { status: 404 }
      );
    }

    const [direccion] = await resolverEnvio([lugar]);
    return NextResponse.json({ result: direccion });
  } catch (error) {
    console.error("[GET /api/direcciones/detalle]", error);
    const status = error instanceof GooglePlacesError && error.status === 404 ? 404 : 502;
    return NextResponse.json(
      { error: "No pudimos ubicar esa dirección. Escríbela a mano." },
      { status }
    );
  }
}
