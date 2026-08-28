import { NextResponse } from "next/server";
import { PREVIEW_COOKIE, PREVIEW_MAX_AGE } from "@/lib/preview";

export const dynamic = "force-dynamic";

/**
 * Puerta de acceso para el equipo mientras el sitio está en modo lanzamiento.
 *
 *   /roaTest2026          → habilita la vista previa y lleva al inicio
 *   /roaTest2026?salir=1  → la cierra y devuelve a la pantalla de espera
 */
export async function GET(request: Request) {
  const salir = new URL(request.url).searchParams.has("salir");

  // Location relativo a propósito. Detrás del proxy de EasyPanel, request.url
  // trae la dirección interna del contenedor (0.0.0.0:80), así que construir
  // una URL absoluta desde ahí mandaba al visitante a https://0.0.0.0:80/.
  // Una ruta relativa la resuelve el navegador contra el dominio real.
  const res = new NextResponse(null, {
    status: 307,
    headers: { Location: salir ? "/proximamente" : "/" },
  });

  if (salir) {
    res.cookies.delete(PREVIEW_COOKIE);
  } else {
    res.cookies.set(PREVIEW_COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: PREVIEW_MAX_AGE,
    });
  }

  return res;
}
