import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { PREVIEW_COOKIE } from "@/lib/preview";

export const dynamic = "force-dynamic";

const VISITOR_COOKIE = "roa_vid";
const VISITOR_MAX_AGE = 60 * 60 * 24 * 365; // un año

/**
 * Única ruta contabilizada. Se valida también en el servidor para que nadie
 * pueda inflar el contador con rutas inventadas.
 */
const PAGINA_CONTADA = "/proximamente";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { path?: string; referrer?: string };

    const path = (body.path ?? "").trim();
    if (path !== PAGINA_CONTADA) {
      return NextResponse.json({ ok: true, ignorada: true });
    }

    const store = await cookies();

    // Identificador anónimo del navegador. Solo sirve para distinguir
    // personas; no se puede vincular con nadie.
    let visitorId = store.get(VISITOR_COOKIE)?.value;
    let esNuevo = false;
    if (!visitorId || visitorId.length < 16) {
      visitorId = randomBytes(16).toString("hex");
      esNuevo = true;
    }

    const team = Boolean(store.get(PREVIEW_COOKIE)?.value);

    // Solo se guarda el dominio de procedencia, no la URL completa
    let referrer: string | null = null;
    const raw = (body.referrer ?? "").trim();
    if (raw) {
      try {
        const host = new URL(raw).hostname;
        const propio = request.headers.get("host")?.split(":")[0];
        referrer = host && host !== propio ? host.slice(0, 120) : null;
      } catch {
        referrer = null;
      }
    }

    await prisma.visit.create({ data: { visitorId, path, referrer, team } });

    const res = NextResponse.json({ ok: true });
    if (esNuevo) {
      res.cookies.set(VISITOR_COOKIE, visitorId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: VISITOR_MAX_AGE,
      });
    }
    return res;
  } catch {
    // Contar visitas nunca debe romper la navegación
    return NextResponse.json({ ok: false });
  }
}
