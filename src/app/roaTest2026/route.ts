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
  const url = new URL(request.url);
  const salir = url.searchParams.has("salir");

  const destino = new URL(salir ? "/proximamente" : "/", url.origin);
  const res = NextResponse.redirect(destino);

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
