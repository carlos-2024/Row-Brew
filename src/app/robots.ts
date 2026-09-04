import type { MetadataRoute } from "next";
import { absoluteUrl, comingSoon } from "@/lib/seo";

export const dynamic = "force-dynamic";

/**
 * Reglas para los buscadores.
 *
 * Mientras el sitio esté en modo lanzamiento se bloquea todo: cualquier URL
 * redirige a la cuenta regresiva, y dejar que Google la recorra solo consigue
 * que indexe la pantalla de espera y tarde en olvidarla después de abrir.
 */
export default function robots(): MetadataRoute.Robots {
  if (comingSoon()) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Nada de esto aporta en una búsqueda, y el ticket de un pedido lleva
        // el nombre de quien lo hizo
        disallow: ["/admin", "/api/", "/pedido/", "/proximamente"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
