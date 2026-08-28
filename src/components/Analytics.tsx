"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/** Única página que se contabiliza mientras dura el modo lanzamiento. */
const PAGINA_CONTADA = "/proximamente";

/**
 * Registra las visitas a la pantalla de espera.
 *
 * Es deliberadamente mínimo: no carga scripts de terceros, no usa
 * identificadores publicitarios y no manda datos fuera del servidor propio.
 * Para medir todo el sitio después del lanzamiento basta con quitar el
 * filtro de abajo (y el equivalente en /api/visita).
 */
export default function Analytics() {
  const pathname = usePathname();
  const ultima = useRef<string | null>(null);

  useEffect(() => {
    if (pathname !== PAGINA_CONTADA) return;

    // En desarrollo React monta dos veces; sin esta guarda cada visita
    // se contaría por duplicado.
    if (ultima.current === pathname) return;
    ultima.current = pathname;

    const cuerpo = JSON.stringify({
      path: pathname,
      referrer: document.referrer || "",
    });

    // keepalive para que la petición sobreviva si el usuario navega enseguida
    fetch("/api/visita", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: cuerpo,
      keepalive: true,
    }).catch(() => {
      /* si falla, se pierde esa visita y ya: nunca debe molestar al usuario */
    });
  }, [pathname]);

  return null;
}
