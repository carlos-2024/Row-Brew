import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { PREVIEW_COOKIE, PREVIEW_PATH, comingSoonEnabled } from "@/lib/preview";

const SESSION_COOKIE = "roa_session";

/** Rutas que siguen abiertas aunque el sitio esté en modo lanzamiento. */
function siempreAbierta(pathname: string): boolean {
  return (
    pathname === "/proximamente" ||
    pathname === PREVIEW_PATH ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/auth")
  );
}

async function protegerAdmin(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const secret = process.env.AUTH_SECRET;

  if (token && secret) {
    try {
      await jwtVerify(token, new TextEncoder().encode(secret));
      return NextResponse.next();
    } catch {
      /* token inválido o vencido → al login */
    }
  }

  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  url.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Panel: siempre pide sesión, esté o no en modo lanzamiento ──
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    return protegerAdmin(request);
  }

  // ── Modo lanzamiento ──
  if (comingSoonEnabled()) {
    const tieneAcceso = Boolean(request.cookies.get(PREVIEW_COOKIE)?.value);

    if (!tieneAcceso && !siempreAbierta(pathname)) {
      // A las APIs se les responde en su propio idioma, no con una redirección
      if (pathname.startsWith("/api")) {
        return NextResponse.json(
          { error: "El sitio aún no está disponible al público." },
          { status: 503 }
        );
      }
      return NextResponse.redirect(new URL("/proximamente", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /**
     * Todo salvo los estáticos de Next y los archivos servidos desde /public.
     * Sin esta exclusión el modo lanzamiento también redirigiría las imágenes
     * y la pantalla de espera se quedaría sin logo.
     */
    "/((?!_next/static|_next/image|favicon.svg|img/|uploads/).*)",
  ],
};
