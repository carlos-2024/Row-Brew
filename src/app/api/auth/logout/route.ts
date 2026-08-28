import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  await destroySession();

  // Location relativo: detrás del proxy, request.url trae la dirección interna
  // del contenedor (0.0.0.0:80) y construir una URL absoluta desde ahí mandaba
  // al usuario a https://0.0.0.0:80/admin/login. El navegador resuelve la ruta
  // relativa contra el dominio real.
  //
  // 303 y no 307: el cierre de sesión llega por POST y la pantalla de login se
  // sirve por GET.
  return new NextResponse(null, {
    status: 303,
    headers: { Location: "/admin/login" },
  });
}
