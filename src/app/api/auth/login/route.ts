import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Datos incompletos." }, { status: 400 });
    }

    const user = await prisma.adminUser.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    // Mismo mensaje para usuario inexistente y clave incorrecta
    const ok = user ? await bcrypt.compare(password, user.passwordHash) : false;
    if (!user || !ok) {
      return NextResponse.json(
        { error: "Correo o contraseña incorrectos." },
        { status: 401 }
      );
    }

    await createSession({ sub: user.id, email: user.email, name: user.name });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[POST /api/auth/login]", error);
    return NextResponse.json(
      { error: "No pudimos iniciar sesión. ¿La base de datos está lista?" },
      { status: 500 }
    );
  }
}
